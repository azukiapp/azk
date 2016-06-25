import h from 'spec/spec_helper';
import { _, path, config, lazy_require } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, defer, promiseResolve } from 'azk/utils/promises';
import { ImageNotAvailable } from 'azk/utils/errors';

var lazy = lazy_require({
  VM         : ['azk/agent/vm'],
  spawnAsync : ['azk/utils/spawn_helper'],
  Client     : ['azk/agent/client'],
});

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
        var exitResult = yield system.runShell({
          command: ["ls -ls bin; exit"],
          stdout: mocks.stdout, stderr: mocks.stderr
        });
        h.expect(exitResult).to.have.property("code", 0);
        h.expect(outputs).to.have.property("stdout").match(/test\-app/);
      });
    });

    it("should support remove container after ended run", function() {
      return async(function* () {
        var exitResult = yield system.runShell({
          command: ["exit"],
          remove: true, stdout: mocks.stdout, stderr: mocks.stderr
        });

        h.expect(exitResult).to.have.property("code", 0);
        var container = h.docker.findContainer(exitResult.containerId);
        return h.expect(container).to.eventually.null;
      });
    });

    it("should raise a error and return log", function() {
      var command = "echo 'error_msg' >&2; sleep 1; echo 'output'; exit 2";
      var regex   = /.*\(2\).*sh.*(.|[\r\n])*error_msg(.|[\r\n])*output/m;
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
          command : "sleep 2;" + "socat TCP4-LISTEN:$HTTP_PORT,fork EXEC:`pwd`/src/bashttpd",
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

    it("run provision before run daemon", function* () {
      var options = { stdout: mocks.stdout, stderr: mocks.stderr };

      // Not provisioned yet
      h.expect(system).to.have.property("provisioned").and.null;

      yield system.runDaemon();
      yield system.runShell(
        _.assign({}, options, { command: "ls -l" })
      );

      // Provisioned
      h.expect(outputs).to.have.property("stdout").match(/bashttpd.conf/);
      h.expect(system).to.have.property("provisioned").and.not.null;
    });

    describe("with env variables", function() {
      var envs;

      before(function() {
        return async(this, function* () {
          var options = {
            command: ["exit"],
            envs: { FOO: "BAR" },
            remove: false, stdout: mocks.stdout, stderr: mocks.stderr
          };

          var api = manifest.system('api');

          yield api.runDaemon();
          var exitResult = yield system.runShell(options);
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

      it("should expand envs in properties", function*() {
        var system = manifest.system('example');
        var exitResult = yield system.runShell({
          shell: "./bin/test-app",
          command: ["echo", "${ECHO_DATA}"],
          stdout: mocks.stdout, stderr: mocks.stderr
        });
        h.expect(exitResult).to.have.property("code", 0);
        h.expect(outputs).to.have.property("stdout").match(/-c echo data/);
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
      let system, subscription;
      let stubs = [];

      beforeEach(() => {
        system = manifest.system("empty");
      });

      afterEach(() => {
        _.each(stubs, (stub) => stub.restore());
        stubs = [];
        if (!_.isEmpty(subscription)) {
          subscription.unsubscribe();
          subscription = null;
        }
      });

      it("should raise error if image not found", function() {
        stubs.push(h.sinon.stub(system.image, 'pull').returns(promiseResolve(false)));
        stubs.push(h.sinon.stub(system.image, 'check').returns(promiseResolve(null)));
        var result = system.runShell({ command: [], image_pull: false});
        return h.expect(result).to.rejectedWith(ImageNotAvailable);
      });

      it("should add system to event object", function* () {
        // stub to generate a event
        var stub = h.sinon.stub(system.image, 'check', () => {
          return defer((resolve) => {
            process.nextTick(() => {
              publish("image.check.status", { type: "action", context: "image", action: "check_image" });
              resolve(system.image);
            });
          });
        });
        stubs.push(stub);

        var wait_msg = null;
        var topic    = 'system.run.image.check.status';
        [wait_msg, subscription] = yield h.wait_subscription(topic);

        yield system.runDaemon().catch(() => {});

        let msg = (yield wait_msg)[0];

        h.expect(msg).to.eql({
          type: 'action',
          context: 'image',
          action: 'check_image',
          system: system
        });
      });
    });
  });

  h.describeRequireVm("with enabled vm", function () {
    this.timeout(20000);

    var system, name;

    beforeEach(() => {
      name   = config("agent:vm:name");
      system = manifest.system('example-sync');
      system.provisioned = new Date();
    });

    afterEach(function* () {
      yield system.stopWatching();
      yield lazy.Client.closeWs();
    });

    it("run watch and sync files", function* () {
      yield system.runWatch(true);

      var dest = system.syncs[_.keys(system.syncs)[0]].guest_folder;
      var cmd, result;

      cmd = "test -d " + path.join(dest, 'bin');
      result = yield lazy.VM.ssh(name, cmd);
      h.expect(result).to.eq(0);

      cmd = "test -d " + path.join(dest, 'src');
      result = yield lazy.VM.ssh(name, cmd);
      h.expect(result).to.eq(0);

      cmd = "test -d " + path.join(dest, 'lib');
      result = yield lazy.VM.ssh(name, cmd);
      h.expect(result).to.eq(1);

      cmd = "test -d " + path.join(dest, 'ignore');
      result = yield lazy.VM.ssh(name, cmd);
      h.expect(result).to.eq(1);
    });
  });
});
