import { Q, _, config, defer, async } from 'azk';
import { Container } from 'azk/docker';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');
var namespace = config('docker:namespace');

describe("Azk docker containers class", function() {
  this.timeout(20000);

  var stdin, outputs = { };
  var mocks = h.mockOutputs(beforeEach, outputs, function() {
    stdin  = h.makeMemoryStream();
    stdin.setRawMode = function() { };
  });

  it("should parse status text", function() {
    var parse = Container.parseStatus;
    h.expect(parse('Up 5 hours')).to.have.eql(
      { ExitCode: 0, Paused: false, Running: true }
    );
    h.expect(parse('Up 10 minutes (Paused)')).to.have.eql(
      { ExitCode: 0, Paused: true, Running: true }
    );
    h.expect(parse('Exited (1) 15 minutes ago')).to.have.eql(
      { ExitCode: 1, Paused: false, Running: false }
    );
  });

  describe("with a cotainer", function() {
    var container;

    beforeEach(() => {
      return h.docker.run(default_img,
        ["/bin/bash", "-c", "echo 'error' >&2; echo 'out';" ],
        { stdout: mocks.stdout, stderr: mocks.stderr }
      ).then((c) => container = c);
    });

    it("should parse status and set state", function() {
      return h.docker.azkListContainers({ all: true }).then((instances) => {
        container = _.find(instances, (c) => { return c.Id == container.Id });
        h.expect(container).to.have.deep.property("State.Running", false);
      });

    });

    it("should parse container name to annotations in get container list", function() {
      return h.docker.azkListContainers({ all: true }).then((instances) => {
        container = _.find(instances, (c) => { return c.Id == container.Id });
        h.expect(container).to.have.deep.property("Annotations.azk.type", "run");
      });
    });

    it("should parse container name to annotations to call inspect", function() {
      return h.docker.getContainer(container.Id).inspect().then((container) => {
        h.expect(container).to.have.deep.property("Annotations.azk.type", "run");
      });
    });
  });
});
