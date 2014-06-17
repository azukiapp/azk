import { Q, _, config, defer } from 'azk';
import docker from 'azk/docker';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');
var namespace = config('docker:namespace');

describe("Azk docker module, run method", function() {
  this.timeout(20000);

  var stdin, outputs = { };
  var mocks = h.mockOutputs(beforeEach, outputs, function() {
    stdin  = h.makeMemoryStream();
    stdin.setRawMode = function() { };
  });

  it("should demux outputs", function() {
    var result = docker.run(default_img,
      ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ],
      { stdout: mocks.stdout, stderr: mocks.stderr }
    );

    return result.then((container) => {
      h.expect(outputs.stdout).to.equal("out\n");
      h.expect(outputs.stderr).to.equal("error\n");
    });
  })

  it("should support interactive run", function() {
    var result = docker.run(default_img,
      ["/bin/bash"],
      { tty: true, stdin: stdin, stdout: mocks.stdout }
    );

    result = result.progress((event) => {
      if (event.type == "started") {
        stdin.write("uname; exit\n");
      }
    });

    return result.then((container) => {
      h.expect(outputs.stdout).to.match(/Linux/);
      return container.remove();
    });
  });

  it("should support envs", function() {
    var result = docker.run(default_img,
      ["/bin/bash", "-c", "env"],
      {
        stdout: mocks.stdout, rm: true,
        env: {
          FOO: "bar", BAZ: "qux"
        }
      }
    );

    return result.then(() => {
      h.expect(outputs.stdout).to.match(/AZK_NAME=.*run.*/);
      h.expect(outputs.stdout).to.match(/FOO=bar/);
      h.expect(outputs.stdout).to.match(/BAZ=qux/);
    });
  });

  it("should support custom dns servers", function() {
    var result = docker.run(default_img,
      ["/bin/bash", "-c", "cat /etc/resolv.conf"],
      {
        stdout: mocks.stdout, rm: true, dns: [ "127.0.0.1", "8.8.8.8" ]
      }
    );

    return result.then(() => {
      h.expect(outputs.stdout).to.match(/nameserver 127.0.0.1/);
      h.expect(outputs.stdout).to.match(/nameserver 8.8.8.8/);
    });
  });

  it("should support bind local and remote volumes", function() {
    var cmd = ["/bin/bash", "-c", "ls -l /azk /app"];
    var options = {
      stdout: mocks.stdout, rm: true,
      volumes: { [__dirname]: "/app" },
      local_volumes: { '/etc/': "/azk" },
    }

    return docker.run(default_img, cmd, options).then(() => {
      h.expect(outputs.stdout).to.match(/run_spec.js/);
      h.expect(outputs.stdout).to.match(/hosts/);
    })
  });

  it("should support bind ports", function() {
    var script = 'socat TCP-LISTEN:1500,fork SYSTEM:\'echo -e "HTTP/1.1\\n\\n $(date)"\'';
    var cmd  = ["/bin/bash", "-c", script];
    var opts = { daemon: true, ports: {} };
    opts.ports["1500/tcp"] = [{ HostIp: "0.0.0.0" }];

    return Q.async(function* () {
      // Run http server
      var container = yield docker.run(default_img, cmd, opts);
      var data = yield container.inspect();

      h.expect(data)
        .to.have.deep.property("NetworkSettings.Ports")
        .and.have.property("1500/tcp")
        .and.length(1);

      var host = data.NetworkSettings.Gateway;
      var port = data.NetworkSettings.Ports["1500/tcp"][0].HostPort;

      // Request
      var _cmd = ["/bin/bash", "-c", `exec 3<>/dev/tcp/${host}/${port}; echo -e "" >&3; cat <&3`];
      yield docker.run(default_img, _cmd, { stdout: mocks.stdout });
      h.expect(outputs.stdout).to.match(/HTTP\/1\.1/);

      return container.kill();
    })();
  });

  it("should support run daemon mode", function() {
    return Q.async(function* () {
      var dir  = yield h.tmp_dir();
      var cmd  = ["/bin/bash", "-c", "while true; do env; sleep 1; done"];
      var opts = { daemon: true };

      var container = yield docker.run(default_img, cmd, opts);
      var data = yield container.inspect();
      h.expect(data).to.have.deep.property("State.Running", true);

      var stream = yield container.attach({
        log: true, stream: true, stdout: true, stderr: true
      });
      container.modem.demuxStream(stream, mocks.stdout, mocks.stderr);
      yield Q.delay(500);
      h.expect(outputs.stdout).to.match(/AZK_NAME=azk/);

      return container.kill();
    })();
  });

  it("should support create with a name", function() {
    return Q.async(function* () {
      var name = `/${namespace}.azk-test-cont-name`;
      var cmd  = ["/bin/true"];
      var opts = { name: name, rm: false, stdout: mocks.stdout };
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      h.expect(data).to.have.property('Name', name);
    })();
  });

  it("should generate a azk namespace name", function() {
    return Q.async(function* () {
      var cmd  = ["/bin/true"];
      var opts = { rm: false, stdout: mocks.stdout };
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      var name = RegExp(namespace + ".run.[0-9a-f]+");
      h.expect(data).to.have.property('Name').and.match(name);
    })();
  });
});
