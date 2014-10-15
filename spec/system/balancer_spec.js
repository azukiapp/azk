import h from 'spec/spec_helper';
import { config, async, Q } from 'azk';
import { System } from 'azk/system';

describe("Azk system class, balancer set", function() {
  var manifest, system;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest = mf;
      system   = manifest.system("api");
    });
  });

  var clean = () => { return system.killAll(); }
  afterEach(clean);
  beforeEach(clean);

  it("should add daemon instances in balancer", function() {
    return async(this, function* () {
      var backends = yield system.backends();

      h.expect(backends).to.eql([system.hostname]);

      yield system.scale(2);
      backends = yield system.backends();

      h.expect(backends).to.length(3);
      h.expect(backends).to.have.deep.property("[0]", system.hostname);
      h.expect(backends).to.have.deep.property("[1]").and.match(/http:\/\/.*:.*/);
      h.expect(backends).to.have.deep.property("[2]").and.match(/http:\/\/.*:.*/);
    });
  });

  it("should remove daemon instances from balancer", function() {
    return async(this, function* () {
      var backends = yield system.backends();

      h.expect(backends).to.eql([system.hostname]);

      yield system.scale(2);
      backends = yield system.backends();
      h.expect(backends).to.length(3);

      yield system.scale(1);
      backends = yield system.backends();
      h.expect(backends).to.length(2);

      yield system.scale(0);
      backends = yield system.backends();
      h.expect(backends).to.eql([system.hostname]);
    });
  });
});
