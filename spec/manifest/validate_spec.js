import { Manifest, file_name } from 'azk/manifest';
import h from 'spec/spec_helper';

describe("Azk manifest class, validate set", function() {
  it("should return blank array for valid manifest", function() {
    return h.mockManifest({}).then((mf) => {
      var err = mf.validate();

      h.expect(err).to.instanceof(Array);
      h.expect(err).to.length(0);
    });
  });

  it("should return invalid manifest with zero systems", function() {
    var app = h.fixture_path('invalids', 'blank');
    var mf  = new Manifest(app);
    var err = mf.validate();

    h.expect(err).to.instanceof(Array);
    h.expect(err[0]).to.have.property("key", "not_systems");
    h.expect(err[0]).to.have.property("manifest").and.eql(mf);
    h.expect(err[0]).to.have.property("level", "warning");
  });

  it("should return deprecate use persistent_folders or mount_folders", function() {
    var data = {
      systems: {
        system1: {
          image: 'any',
          mount_folders: { '.': '/azk' }
        },
        system2: {
          image: 'any',
          persistent_folders: [ '/data' ]
        }
      },
    }
    return h.mockManifestWithData(data).then((mf) => {
      var err = mf.validate();

      h.expect(err).to.instanceof(Array);
      h.expect(err).to.length(2);

      h.expect(err[0]).to.have.property("key", "old_volumes");
      h.expect(err[0]).to.have.property("manifest").and.eql(mf);
      h.expect(err[0]).to.have.property("level", "deprecate");
      h.expect(err[0]).to.have.property("system", "system1");
    });
  });
});
