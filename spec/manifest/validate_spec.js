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

  it("should return deprecate use http hostname", function() {
    var content = `
      system('system1', {
        image: "any",
        http : { hostname: "foo.azk.dev" },
      });
    `
    return h.mockManifestWithContent(content).then((mf) => {
      var err = mf.validate();

      h.expect(err).to.instanceof(Array);
      h.expect(err).to.length(1);

      h.expect(err[0]).to.have.property("key", "deprecated");
      h.expect(err[0]).to.have.property("option", "http.hostname");
      h.expect(err[0]).to.have.property("new_option", "http.domains");
      h.expect(err[0]).to.have.property("manifest").and.eql(mf);
      h.expect(err[0]).to.have.property("level", "deprecate");
      h.expect(err[0]).to.have.property("system", "system1");
    });
  });
});
