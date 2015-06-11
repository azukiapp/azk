import h from 'spec/spec_helper';
import { _ } from 'azk';
import { publish, subscribe } from 'azk/utils/postal';
import { async, defer, promiseResolve, promiseReject } from 'azk/utils/promises';
import { ImageNotAvailable } from 'azk/utils/errors';

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
      return manifest.cleanMetaAsync();
    });

    it("should run a command in a shell for a system", function() {
      return async(function* () {
        var exitResult = yield system.runShell(
          ["/bin/sh", "-c", "ls -ls; exit"],
          { stdout: mocks.stdout, stderr: mocks.stderr }
        );
        h.expect(exitResult).to.have.property("code", 0);
        h.expect(outputs).to.have.property("stdout").match(/.*src/);
      });
    });

    it("should support remove container after ended run", function() {
      return async(function* () {
        var exitResult = yield system.runShell(
          ["/bin/sh", "-c", "exit"],
          { remove: true, stdout: mocks.stdout, stderr: mocks.stderr }
        );

        h.expect(exitResult).to.have.property("code", 0);
        var container = h.docker.findContainer(exitResult.containerId);
        return h.expect(container).to.eventually.null;
      });
    });

    it("should raise a error and return log", function() {
      var command = ["/bin/bash", "-c", "echo 'error_msg' >&2; sleep 1; echo 'output'; exit 2"];
      var regex   = /.*\(2\).*bash.*(.|[\r\n])*error_msg(.|[\r\n])*output/m;
      var result  = system.runDaemon({ retry: 2, timeout: 1000, command: command });

      return async(this, function*() {
        var err = yield result.catch((err) => { return err; });
        h.expect(err).to.instanceOf(Error).and.match(regex);

        var data = yield h.docker.findContainer(err.container.Id);
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
        var options    = {
          command : ["/bin/bash", "-c", "sleep 2;" + "socat TCP4-LISTEN:$HTTP_PORT,fork EXEC:`pwd`/src/bashttpd"],
          ports: {
            http: '31275:31275/tcp'
          }
        };

        var container  = yield system.runDaemon(options);
        var data       = yield container.inspect();

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
        return h.expect(container.inspect().catch(() => {})).to.reject;
      });
    });

    it("run provision before run daemon", function() {
      h.expect(system).to.have.property("provisioned").and.null;

      return async(function* () {
        var command = ["/bin/sh", "-c"];
        var options = { stdout: mocks.stdout, stderr: mocks.stderr };

        var exitResult = yield system.runShell([...command].concat("rm provisioned; ls -l"), options);
        h.expect(exitResult).to.have.property("code", 0);
        yield system.runDaemon();

        yield system.runShell([...command].concat("ls -l"), options);
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
          for (var i = 0; i < 3; i++) {
            yield system.runDaemon();
          }
          var instances = yield system.instances({ type: "daemon" });

          h.expect(instances).to.length(3);
          h.expect(instances).to.have.deep.property("[0].Annotations.azk.seq", "1");
          h.expect(instances).to.have.deep.property("[1].Annotations.azk.seq", "2");
          h.expect(instances).to.have.deep.property("[2].Annotations.azk.seq", "3");
        });
      });
    });

    describe("check image before run", function() {
      // TODO: Replace this merge for a mock class
      var system, image_mock = {
        pull() {
          return defer((resolve) => {
            process.nextTick(() => {
              publish("spec.image_mock.status", { type: "event" });
              resolve(this);
            });
          });
        },

        check() {
          return promiseResolve(null);
        },

        inspect() {
          return promiseReject({});
        }
      };

      var events;
      var _subscription;
      var _subscription2;

      before(() => {
        system = manifest.system("empty");
        system.image = _.merge({}, system.image, image_mock);

        _subscription = subscribe('spec.image_mock.status', (event) => {
          events.push(event);
        });

      });
      after(() => {
        _subscription.unsubscribe();
      });

      beforeEach(() => {
        events   = [];
      });

      it("should raise error if image not found", function() {

        // mock check to return null
        system.image.check = function () {
          return defer((resolve) => {
            process.nextTick(() => {
              publish("image.check.status", { type: "action", context: "image", action: "check_image" });
              resolve(null);
            });
          });
        };

        var result = system.runShell([], { image_pull: false});
        return h.expect(result).to.rejectedWith(ImageNotAvailable);
      });

      it("should add system to event object", function() {
        return async(function* () {

          // force azk to think that the image is builded
          system.image.builded = true;

          // mock check to return null
          system.image.check = function () {
            return defer((resolve) => {
              process.nextTick(() => {
                publish("image.check.status", { type: "action", context: "image", action: "check_image" });
                resolve(system.image);
              });
            });
          };

          _subscription2 = subscribe('system.run.image.check.status', (event) => {
            events.push(event);
          });

          yield system.runDaemon()
                .catch(() => {});

          _subscription2.unsubscribe();

          h.expect(events).to.have.deep.property("[0]").and.eql(
            { type: 'action',
              context: 'image',
              action: 'check_image',
              system: system }
          );
        });
      });
    });
  });
});
