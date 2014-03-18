var h      = require('./spec_helper.js');
var docker = require('../lib/docker');
var qfs    = require('q-io/fs');
var path   = require('path');

var azk = h.azk;

describe("Azk docker client", function() {
  this.timeout(20000);

  it("should use constants options", function() {
    return h.expect(docker.info())
      .to.eventually.have.property("Containers")
      .and.is.an('Number');
  })

  it("should get a image", function() {
    var image = docker.getImage(azk.cst.DOCKER_DEFAULT_IMG);
    h.expect(image.name).to.equal(azk.cst.DOCKER_DEFAULT_IMG);

    return h.expect(image.inspect())
      .to.eventually.have.property("id")
      .and.is.an("String");
  });

  describe("run", function() {
    var stdin, outputs = { };
    var mocks = h.mock_outputs(beforeEach, outputs, function() {
      stdin  = new h.MemoryStream();
      stdin.setRawMode = function() { };
    });

    it("should demux outputs", function() {
      var cmd  = ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ];
      var opts = { stdout: mocks.stdout, stderr: mocks.stderr };

      return docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts)
      .then(function(container) {
        h.expect(outputs.stdout).to.equal("out\n");
        h.expect(outputs.stderr).to.equal("error\n");
        return container.remove();
      });
    })

    it("should support interactive run", function() {
      var cmd  = ["/bin/bash"];
      var opts = { tty: true, stdin: stdin, stdout: mocks.stdout };

      return docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts)
      .progress(function(event) {
        if (event.type == "started") {
          stdin.write("uname; exit\n");
        }
      })
      .then(function(container) {
        h.expect(outputs.stdout).to.match(/Linux/);
        return container.remove();
      });
    });

    it("should support envs", function() {
      var cmd  = ["/bin/bash", "-c", "env"];
      var opts = { stdout: mocks.stdout, rm: true, env: {
        FOO: "bar", BAZ: "qux"
      }};

      return docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts)
      .then(function() {
        h.expect(outputs.stdout).to.match(/FOO=bar/);
        h.expect(outputs.stdout).to.match(/BAZ=qux/);
      });
    });

    it("should support bind volumes", function() {
      var cmd  = ["/bin/bash", "-c", "ls -l /azk"];
      var opts = { stdout: mocks.stdout, rm: true, volumes: {} };

      opts.volumes[__dirname] = [ "/azk" ];

      return docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts)
      .then(function() {
        h.expect(outputs.stdout).to.match(/docker_spec\.js/);
      });
    });

    it("should support bind ports", function() {
      var script = 'while true ; do (echo -e "HTTP/1.1\\n\\n $(date)") | nc -l 1500; test $? -gt 128 && break; sleep 1; done';
      var cmd = ["/bin/bash", "-c", script];
      var opts = { daemon: true, ports: {} };

      opts.ports["1500/tcp"] = [{ HostIp: "0.0.0.0" }];

      return h.Q.async(function* () {
        var container = yield docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts);
        var data = yield container.inspect();
        var port = data.NetworkSettings.Ports["1500/tcp"][0].HostPort;

        var _cmd = ["/bin/bash", "-c", "echo | nc -d " + azk.cst.VM_IP + " " + port];
        yield docker.run(azk.cst.DOCKER_DEFAULT_IMG, _cmd, { stdout: mocks.stdout });

        h.expect(outputs.stdout).to.match(/HTTP\/1\.1/);

        return container.kill();
      })();
    });

    it("should support autoremove container", function() {
      var result  = docker.run(azk.cst.DOCKER_DEFAULT_IMG, ["/bin/true"], { rm: true });
      var removed = false;

      result = result.progress(function(event) {
        if (event.type == "removing") {
          removed = true;
        }
      });

      result = result.then(function(container) {
        h.expect(removed).to.ok;
        return container.inspect();
      });

      return h.expect(result).to.eventually.rejectedWith(Error, /404/);
    });

    it("should support run daemon mode", function() {
      return h.Q.async(function* () {
        var dir  = yield h.tmp.dir();
        var cmd  = ["/bin/bash", "-c", "while true; do env > /azk/log; sleep 1; done"];
        var opts = { daemon: true, volumes: {}, working_dir: "/azk" };
        opts.volumes[azk.utils.resolve(dir)] = ["/azk"];

        var container = yield docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts);
        var data = yield container.inspect();
        h.expect(data).to.have.deep.property("State.Running", true);

        yield h.Q.delay(500);

        var data = yield qfs.read(path.join(dir, "log"));
        h.expect(data).to.match(/PWD=\/azk/);
      })();
    });

    it("should support create with a name", function() {
      return h.Q.async(function* () {
        var name = "/azk-test-cont-name";
        var cmd  = ["/bin/true"];
        var opts = { name: name, rm: false, stdout: mocks.stdout };
        var cont = yield docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts);
        var data = yield cont.inspect();

        h.expect(data).to.have.property('Name', name);
      })();
    });

    it("should generate a azk namespace name", function() {
      return h.Q.async(function* () {
        var cmd  = ["/bin/true"];
        var opts = { rm: false, stdout: mocks.stdout };
        var cont = yield docker.run(azk.cst.DOCKER_DEFAULT_IMG, cmd, opts);
        var data = yield cont.inspect();

        var name = RegExp(azk.cst.DOCKER_NS_NAME + ".run.[0-9a-f]+");
        h.expect(data).to.have.property('Name').and.match(name);
      })();
    });
  });

  it("should get and inspect image by name", function() {
    return h.expect(docker.findImage(azk.cst.DOCKER_DEFAULT_IMG)).
      to.eventually.has.property("name");
  });

  it("should get and return null if not exist image", function() {
    return h.expect(docker.findImage("not_exist")).
      to.eventually.not.exist;
  });
})
