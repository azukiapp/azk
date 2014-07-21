import h from 'spec/spec_helper';
import { config, async, Q } from 'azk';
import { System } from 'azk/system';
import { Scale } from 'azk/system/scale';
import { SystemDependError } from 'azk/utils/errors';
import docker from 'azk/docker';

describe("systems, scale", function() {
  var manifest, system;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest = mf;
      system = manifest.systemDefault;
    });
  });

  describe("scale one system", function() {
    afterEach(function() {
      return system.killAll().fail(() => {});
    });

    it("should not run system if its dependencies are not met", function() {
      var result = system.scale(1);
      return h.expect(result).to.eventually.rejectedWith(SystemDependError);
    });

    it("should scale one instances", function() {
      var db = manifest.system('db');
      return async(this, function* () {
        var result = yield db.scale(1);
        var instances = yield db.instances();

        h.expect(result).to.ok;
        h.expect(instances).to.length(1);

        var container   = yield docker.getContainer(instances[0].Id).inspect();
        var annotations = container.Annotations.azk;
        h.expect(annotations).to.have.deep.property("type", 'daemon');
        h.expect(annotations).to.have.deep.property("sys", db.name);
        h.expect(annotations).to.have.deep.property("seq", '1');
      });
    });

    it("should scale a system with dependencies", function() {
      return async(this, function* () {
        yield manifest.system('db').scale(1);
        yield manifest.system('api').scale(1);
        var result = yield system.scale(3);
        var instances = yield system.instances();

        h.expect(result).to.ok;
        h.expect(instances).to.length(3);

        var container   = yield docker.getContainer(instances[0].Id).inspect();
        var annotations = container.Annotations.azk;
        h.expect(annotations).to.have.deep.property("type", 'daemon');
        h.expect(annotations).to.have.deep.property("sys", system.name);
        h.expect(annotations).to.have.deep.property("seq", '1');
      });
    });
  });
});

