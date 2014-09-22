import { Q, _, config, defer, async, utils } from 'azk';
import docker from 'azk/docker';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');
var namespace = config('docker:namespace');

describe("Azk docker module, run method @slow", function() {
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

  it("should support bind volumes", function() {
    var cmd = ["/bin/bash", "-c", "ls -l /azk"];
    var options = {
      stdout: mocks.stdout, rm: true,
      volumes: {
        "/azk": utils.docker.resolvePath(__dirname),
      },
    }

    return docker.run(default_img, cmd, options).then(() => {
      h.expect(outputs.stdout).to.match(/run_spec.js/);
    })
  });

  it("should support bind ports", function() {
    var script = 'socat TCP-LISTEN:1500,fork SYSTEM:\'echo -e "HTTP/1.1\\n\\n $(date)"\'';
    var cmd  = ["/bin/bash", "-c", script];
    var opts = { daemon: true, ports: {} };
    opts.ports["1500/tcp"] = [{ HostIp: "0.0.0.0" }];

    return async(function* () {
      // Run http server
      var container = yield docker.run(default_img, cmd, opts);
      var data = yield container.inspect();

      var name = data.NetworkSettings.Access["1500"].name;
      var host = data.NetworkSettings.Access["1500"].gateway;
      var port = data.NetworkSettings.Access["1500"].port;
      var protocol = data.NetworkSettings.Access["1500"].protocol;

      h.expect(name).to.equal("1500");
      h.expect(protocol).to.equal("tcp");

      // Request
      var _cmd = ["/bin/bash", "-c", `exec 3<>/dev/tcp/${host}/${port}; echo -e "" >&3; cat <&3`];
      yield docker.run(default_img, _cmd, { stdout: mocks.stdout });
      h.expect(outputs.stdout).to.match(/HTTP\/1\.1/);

      return container.kill();
    });
  });

  it("should support run daemon mode", function() {
    return async(function* () {
      var dir  = yield h.tmp_dir();
      var cmd  = ["/bin/bash", "-c", "while true; do env; sleep 1; done"];
      var opts = { daemon: true };

      var container = yield docker.run(default_img, cmd, opts);
      var data = yield container.inspect();
      h.expect(data).to.have.deep.property("State.Running", true);

      var log = "";
      yield container.logs({stdout: true, stderr: true}).then((stream) => {
        var stdout = {
          write(data) { log += data.toString(); }
        }
        container.modem.demuxStream(stream, stdout, stdout);
        return true;
      });

      yield Q.delay(500);
      h.expect(log).to.match(new RegExp(h.escapeRegExp(`AZK_NAME=${data.Name.slice(1)}`), 'm'));

      return container.kill();
    });
  });

  it("should support extra docker options in start", function() {
    return async(function* () {
      var memory = 10 * 1024 * 1024;
      var cmd    = ["/bin/true"];
      var opts   = { rm: false, stdout: mocks.stdout, docker: {
        start : { Privileged: true },
        create: { Memory: memory },
      }};
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      h.expect(data).to.have.deep.property('HostConfig.Privileged').and.to.ok;
      h.expect(data).to.have.deep.property('Config.Memory', memory);
    });
  });

  it("should support create with a name", function() {
    return async(function* () {
      var name = `/${namespace}.azk-test-cont-name`;
      var cmd  = ["/bin/true"];
      var opts = { name: name, rm: false, stdout: mocks.stdout };
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      h.expect(data).to.have.property('Name', name);
    });
  });

  it("should composer name by annotations", function() {
    return async(function* () {
      var annotations = { azk: {
        key1: "v1",
        key2: "v2",
        type: "daemon",
      }};
      var cmd  = ["/bin/true"];
      var opts = { rm: false, stdout: mocks.stdout, annotations };
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      h.expect(data).to.have.deep.property("Annotations.azk.azk" , "test");
      h.expect(data).to.have.deep.property("Annotations.azk.uid").and.match(/^[0-9a-f]+$/);
      h.expect(data).to.have.deep.property("Annotations.azk.key1", "v1");
      h.expect(data).to.have.deep.property("Annotations.azk.key2", "v2");
    });
  });

  it("should export annotations to env", function() {
    return async(function* () {
      var annotations = { azk: {
        key1: "v1",
        key2: "v2",
        type: "daemon",
      }};
      var cmd  = ["/bin/true"];
      var opts = { rm: false, stdout: mocks.stdout, annotations };
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      var envs = data.Config.Env;
      h.expect(envs).to.include.something.that.match(/AZK_ENV=test/);
      h.expect(envs).to.include.something.that.match(/AZK_UID=[0-9a-f]+/);
      h.expect(envs).to.include.something.that.match(/AZK_KEY1=v1/);
      h.expect(envs).to.include.something.that.match(/AZK_KEY2=v2/);
    });
  });

  it("should composer name by default annotations", function() {
    return async(function* () {
      var cmd  = ["/bin/true"];
      var opts = { rm: false, stdout: mocks.stdout };
      var cont = yield docker.run(default_img, cmd, opts);
      var data = yield cont.inspect();

      h.expect(data).to.have.deep.property("Annotations.azk.azk" , "test");
      h.expect(data).to.have.deep.property("Annotations.azk.type", "run");
      h.expect(data).to.have.deep.property("Annotations.azk.uid").and.match(/^[0-9a-f]+$/);

      var name = RegExp(namespace + "_type.run_uid.[0-9a-f]+");
      h.expect(data).to.have.property('Name').and.match(name);
    });
  });
});
