import h from 'spec/spec_helper';
import { _, config, lazy_require } from 'azk';
import { async } from 'azk';

var l = lazy_require({
  ContainersObserver: ['azk/docker/containers_observer']
});

describe("Azk docker, ContainersObserver class", function() {
  var observer, sub = null;
  var image = config('docker:image_default');

  var stdin, outputs = { };
  var mocks = h.mockOutputs(beforeEach, outputs, function() {
    stdin   = h.makeMemoryStream();
    stdin.setRawMode = function() { };
  });

  function run_container(opts = {}) {
    return h.docker.run(image,
      ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ],
      _.merge({ stdout: mocks.stdout, stderr: mocks.stderr }, opts)
    );
  }

  afterEach(() => {
    if (!_.isEmpty(sub)) {
      sub.unsubscribe();
      sub = null;
    }

    if (!_.isEmpty(observer)) {
      return observer.stop();
    }
  });

  it("should postal events about the containers", function() {
    return async(function* () {
      var topic    = "containers.observer.*";
      var filter   = (msg) => msg.status === "die";
      var wait_msg = null;
      [wait_msg, sub] = yield h.wait_subscription(topic, filter);

      observer = new l.ContainersObserver();
      yield observer.start();
      yield run_container();

      h.expect(outputs.stdout).to.equal("out\n");
      h.expect(outputs.stderr).to.equal("error\n");

      var msgs = yield wait_msg;
      h.expect(msgs).to.containSubset([{from: image, status: 'create'}]);
      h.expect(msgs).to.containSubset([{from: image, status: 'start'}]);
      h.expect(msgs).to.containSubset([{from: image, status: 'die'}]);
    });
  });

  it("should filter events about the containers", function() {
    return async(function* () {
      var topic    = "containers.observer.*";
      var filter   = (_, msgs) => msgs.length == 2;
      var wait_msg = null;
      [wait_msg, sub] = yield h.wait_subscription(topic, filter);

      observer = new l.ContainersObserver({ event: ["create", "start"]});
      yield observer.start();
      yield run_container();

      h.expect(outputs.stdout).to.equal("out\n");
      h.expect(outputs.stderr).to.equal("error\n");

      var msgs = yield wait_msg;
      h.expect(msgs).to.containSubset([{from: image, status: 'create'}]);
      h.expect(msgs).to.containSubset([{from: image, status: 'start'}]);
      h.expect(msgs).to.not.containSubset([{from: image, status: 'die'}]);
    });
  });

  it("should support stop observer", function() {
    return async(function* () {
      var topic    = "containers.observer.*";
      var filter   = (_, msgs) => msgs.length == 1;
      var wait_msg = null;
      [wait_msg, sub] = yield h.wait_subscription(topic, filter);

      observer = new l.ContainersObserver();
      yield observer.start();
      yield run_container();

      h.expect(outputs.stdout).to.equal("out\n");
      h.expect(outputs.stderr).to.equal("error\n");

      var msgs = yield wait_msg;
      h.expect(msgs).to.containSubset([{from: image, status: 'create'}]);

      yield observer.stop();
      [wait_msg, sub] = yield h.wait_subscription(topic, filter);
      yield run_container();
      setImmediate(() => observer.publish("fake", { status: "fake" }));

      msgs = yield wait_msg;
      h.expect(msgs).to.not.containSubset([{from: image, status: 'create'}]);
      h.expect(msgs).to.be.eql([{status: 'fake'}]);
    });
  });
});
