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
    it("should demux outputs", function() {
      var outputs = { stdout: '', stderr: '' };

      var stdout = new MemoryStream();
      stdout.on('data', function(data) {
        outputs.stdout += data.toString();
      });

      var stderr = new MemoryStream();
      stderr.on('data', function(data) {
        outputs.stderr += data.toString();
      });

      var cmd  = ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ]
      var opts = { stdout: stdout, stderr: stderr }
      return docker.run("ubuntu:12.04", cmd, opts)
      .then(function(container) {
        expect(outputs.stdout).to.equal("out\n");
        expect(outputs.stderr).to.equal("error\n");
        return container.remove();
      });
    })

    it("should support interactive run", function() {
      var stdin  = new MemoryStream();
      stdin.setRawMode = function() { };

      var stdout = new MemoryStream();
      var output = '';
      stdout.on('data', function(data) {
        output += data.toString();
      });

      return docker.run("ubuntu:12.04", ["/bin/bash"], { stdin: stdin, stdout: stdout })
      .progress(function(event) {
        if (event == "started") {
          stdin.write("uptime; exit\n");
        }
      })
      .then(function(container) {
        expect(output).to.match(/.*users.*load average.*/);
        return container.remove();
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
  })
})
