var helper = require('./spec_helper.js');
var docker = require('../lib/docker');
var MemoryStream = require('memorystream');

var expect = helper.expect;

describe("Azk docker client", function() {
  it("should use constants options", function() {
    return expect(docker.info())
      .to.eventually.have.property("Containers")
      .and.is.an('Number');
  })

  it("should get a image", function() {
    var image = docker.getImage("ubuntu:12.04");
    expect(image.name).to.equal("ubuntu:12.04");

    return expect(image.inspect())
      .to.eventually.have.property("id")
      .and.is.an("String");
  });

  describe("run", function() {
    var stdin, stdout, stderr;
    var outputs = { stdout: '', stderr: '' };

    beforeEach(function() {
      stdin  = new MemoryStream();
      stdout = new MemoryStream();
      stderr = new MemoryStream();

      stdin.setRawMode = function() { };

      stdout.on('data', function(data) {
        outputs.stdout += data.toString();
      });

      stderr.on('data', function(data) {
        outputs.stderr += data.toString();
      });

      outputs.stdout = '';
      outputs.stderr = '';
    });

    it("should demux outputs", function() {
      var cmd  = ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ];
      var opts = { stdout: stdout, stderr: stderr };

      return docker.run("ubuntu:12.04", cmd, opts)
      .then(function(container) {
        expect(outputs.stdout).to.equal("out\n");
        expect(outputs.stderr).to.equal("error\n");
        return container.remove();
      });
    })

    it("should support interactive run", function() {
      var cmd  = ["/bin/bash"];
      var opts = { tty: true, stdin: stdin, stdout: stdout };

      return docker.run("ubuntu:12.04", cmd, opts)
      .progress(function(event) {
        if (event.type == "started") {
          stdin.write("uptime; exit\n");
        }
      })
      .then(function(container) {
        expect(outputs.stdout).to.match(/.*users.*load average.*/);
        return container.remove();
      });
    });

    it("should support mount volumes", function() {
      var cmd  = ["/bin/bash", "-c", "ls -l /azk"];
      var opts = { stdout: stdout, rm: true, volumes: {} };

      opts.volumes[__dirname] = [ "/azk" ];

      return docker.run("ubuntu:12.04", cmd, opts)
      .then(function() {
        expect(outputs.stdout).to.match(/docker_spec\.js/);
      });
    });

    it("should suppor autoremove container", function() {
      return expect(
        docker.run("ubuntu:12.04", ["/bin/true"], { rm: true }).
        then(function(container) {
          return container.inspect();
        })
      ).to.eventually.rejectedWith(Error, /404/);
    });

    it("should get and inspect image by name", function() {
      return expect(docker.findImage("ubuntu:12.04")).
        to.eventually.has.property("id");
    });

    it("should get and return null if not exist image", function() {
      return expect(docker.findImage("not_exist")).
        to.eventually.not.exist;
    });
  })
})
