import h from 'spec/spec_helper';
import { config, async, defer, Q } from 'azk';
import { System } from 'azk/system';
import { Run } from 'azk/system/run';
import { ImageNotAvailable } from 'azk/utils/errors';

describe("systems, run", function() {
  var manifest, system;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest = mf;
      system = manifest.systemDefault;
    });
  });

  var stdin, outputs = { };
  var mocks = h.mockOutputs(beforeEach, outputs, function() {
    stdin = h.makeMemoryStream();
    stdin.setRawMode = function() { };
  });

  describe("run a system", function() {
    it("should run a command in a shell for a system", function() {
      return async(function* () {
        var container = yield system.runShell(
          ["/bin/sh", "-c", "ls -ls; exit"],
          { stdout: mocks.stdout, stderr: mocks.stderr }
        );
        h.expect(outputs).to.have.property("stdout").match(/root.*src/);
      });
    });

    it("should run with envs", function() {
      return async(function* () {
        yield system.runShell(
          ["/bin/sh", "-c", "env; exit"],
          { envs: { FOO: "BAR" }, stdout: mocks.stdout, stderr: mocks.stderr }
        );
        h.expect(outputs).to.have.property("stdout").match(/FOO=BAR/);
      });
    });

    it("should run a daemon with system options", function() {
      return async(function* () {
        var container = yield system.runDaemon();
        return container.inspect().then((data) => {
          console.log(data);
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


