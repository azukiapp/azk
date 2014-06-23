import h from 'spec/spec_helper';
import { config } from 'azk';
import { System } from 'azk/system';
import { Scale } from 'azk/system/scale';
import { SystemDependError } from 'azk/utils/errors';

describe("systems, scale", function() {
  var manifest, system;

  before(function() {
    return h.mockManifest({}).then((mf) => {
      manifest = mf;
      system = manifest.systemDefault;
    });
  });

  describe("scale one system", function() {
    it("should not run system if its dependencies are not met", function() {
      var result = Scale.scale(system, 1);
      return h.expect(result).to.eventually.rejectedWith(SystemDependError)
    });
  });
});

