import h from 'spec/spec_helper';
import { _, config, async, defer, Q, fs } from 'azk';
import { System } from 'azk/system';
import { Run } from 'azk/system/run';
import { ImageNotAvailable } from 'azk/utils/errors';
import docker from 'azk/docker';

describe("Azk system class, run set", function() {
  var manifest, system;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest = mf;
      system = manifest.system('example');
    });
  });

  var stdin, outputs = { };
  var mocks = h.mockOutputs(beforeEach, outputs, function() {
    stdin = h.makeMemoryStream();
    stdin.setRawMode = function() { };
  });

  describe("in valid azk project", function() {
    afterEach(() => {
      manifest.cleanMeta();
    });

    it("should run a command in a shell for a system", function() {
      return async(function* () {
        var exitResult = yield system.runShell(
          ["/bin/sh", "-c", "ls -ls; exit"],
          { stdout: mocks.stdout, stderr: mocks.stderr }
        );
        h.expect(exitResult).to.have.property("code", 0);
        h.expect(outputs).to.have.property("stdout").match(/root.*src/);
      });
    });

    it("should support remove container after ended run", function() {
      return async(function* () {
        var exitResult = yield system.runShell(
          ["/bin/sh", "-c", "exit"],
          { remove: true, stdout: mocks.stdout, stderr: mocks.stderr }
        );

        h.expect(exitResult).to.have.property("code", 0);
        var container = docker.findContainer(exitResult.containerId);
        return h.expect(container).to.eventually.null;
      });
    });

    it("should raise a error and return log", function() {
      var command = ["/bin/bash", "-c", "echo 'error_msg' >&2; sleep 1; echo 'output'; exit 2"];
      var regex   = /.*\(2\).*bash.*(.|[\r\n])*error_msg(.|[\r\n])*output/m;
      var result  = system.runDaemon({ retry: 2, timeout: 1000, command: command });

      return async(this, function*() {
        var err = yield result.fail((err) => { return err });
        h.expect(err).to.instanceOf(Error).and.match(regex);

        var data = yield docker.findContainer(err.container.Id);
        h.expect(data).to.null;
      });
    });

    it("should run a daemon with system options", function() {
      return async(function* () {
        var container = yield system.runDaemon();
        var data      = yield container.inspect();
        h.expect(data).to.have.deep.property('Annotations.azk.sys', system.name);
        h.expect(data).to.have.deep.property('State.ExitCode', 0);
        h.expect(data).to.have.deep.property('State.Running').and.ok;
      });
    });

    it("should run and wait for port", function() {
      return async(function* () {
        var command   = ["/bin/bash", "-c", "sleep 2; " + system.raw_command];
        var container = yield system.runDaemon({ command: command });
        var data      = yield container.inspect();
        h.expect(data).to.have.deep.property('Annotations.azk.sys', system.name);
        h.expect(data).to.have.deep.property('State.ExitCode', 0);
        h.expect(data).to.have.deep.property('State.Running').and.ok;
      });
    });

    it("should run and stop daemon with system options", function() {
      return async(function* () {
        var container = yield system.runDaemon();
        var data = yield container.inspect();
        yield system.stop([data]);
        return h.expect(container.inspect()).to.reject;
      });
    });

    it("run provision before run daemon", function() {
      h.expect(system).to.have.property("provisioned").and.null;

      return async(function* () {
        var command = ["/bin/sh", "-c"];
        var options = { stdout: mocks.stdout, stderr: mocks.stderr };

        var exitResult = yield system.runShell([...command, "rm provisioned; ls -l"], options);
        h.expect(exitResult).to.have.property("code", 0);
        yield system.runDaemon();

        yield system.runShell([...command, "ls -l"], options);
        h.expect(outputs).to.have.property("stdout").match(/provisioned/);

        h.expect(system).to.have.property("provisioned").and.not.null;
      });
    });

    describe("with env variables", function() {
      var envs;

      before(function() {
        return async(this, function* () {
          var cmd = ["/bin/sh", "-c", "exit"];
          var options = {
            envs: { FOO: "BAR" },
            remove: false, stdout: mocks.stdout, stderr: mocks.stderr
          };

          var api = manifest.system('api');

          yield api.runDaemon();
          var exitResult = yield system.runShell(cmd, options);
          var data = yield exitResult.container.inspect();

          envs = data.Config.Env;

          yield exitResult.container.remove();
          yield api.stop();
        });
      });

      it("loaded from dependencies system in a shell", function() {
        h.expect(envs).to.include.something.that.match(/API_URL=http/);
      });

      it("loaded from parameters", function() {
        h.expect(envs).to.include.something.that.match(/FOO=BAR/);
      });

      it("load from manifest", function() {
        h.expect(envs).to.include.something.that.match(/ECHO_DATA=data/);
      });

      it("load from .env file", function() {
        h.expect(envs).to.include.something.that.match(/FROM_DOT_ENV=azk is beautiful/);
      });
    });

    describe("run mutiple same system and type", function() {
      beforeEach(() => {
        return system.killAll();
      });

      it("should use a sequencial number in name", function() {
        return async(this, function* () {
          for(var i = 0; i < 3; i++) { yield system.runDaemon(); }
          var instances = yield system.instances({ type: "daemon" });

          h.expect(instances).to.length(3);
          h.expect(instances).to.have.deep.property("[0].Annotations.azk.seq", "1");
          h.expect(instances).to.have.deep.property("[1].Annotations.azk.seq", "2");
          h.expect(instances).to.have.deep.property("[2].Annotations.azk.seq", "3");
        });
      });
    });

    describe("check image before run", function() {
      var system, image = {
        pull() {
          return defer((resolve, reject, notify) => {
            process.nextTick(() => {
              notify({ type: "event" });
              resolve(this);
            });
          });
        },

        check() {
          return Q.resolve(null);
        },

        inspect() {
          return Q.reject({});
        }
      }

      before(() => {
        system = manifest.system("empty");
        image.name = system.image.name;
        system.image = image;
      });

      it("should raise error if image not found", function() {
        var result = system.runShell([], { image_pull: false})
        return h.expect(result).to.rejectedWith(ImageNotAvailable);
      });

      it("should add system to event object", function() {
        return async(function* () {
          var events   = [];
          var progress = (event) => {
            events.push(event);
            return event;
          };

          var container = yield system.runDaemon().progress(progress).fail(() => {});
          h.expect(events).to.have.deep.property("[0]").and.eql(
            { type: "event", system: system }
          );
        });
      });
    });
  });
});


