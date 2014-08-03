import h from 'spec/spec_helper';
import { Helpers } from 'azk/cli/helpers';
import { System } from 'azk/system';
import { _ } from 'azk';

describe("Azk cli helpers module", function() {
  var manifest;

  before(() => {
    var data = { };
    return h.mockManifest(data).then((mf) => {
      manifest = mf;
    });
  });

  describe("call getSystemsByName", function() {
    it("should return all systems", function() {
      var systems = Helpers.getSystemsByName(manifest);
      h.expect(systems).to.length(_.keys(manifest.systems).length);
      h.expect(systems).to.has.deep.property("[0]").to.equal(
        manifest.system("expand-test")
      )
      h.expect(systems).to.has.deep.property("[7]").to.equal(
        manifest.system("example")
      )
    });

    it("should return one system", function() {
      var systems = Helpers.getSystemsByName(manifest, "example");
      h.expect(systems).to.length(1);
      h.expect(systems[0]).to.instanceOf(System);
      h.expect(systems[0]).to.have.property("name", "example");
    });

    it("should return one or more systems", function() {
      var systems = Helpers.getSystemsByName(manifest, "example,db");
      h.expect(systems).to.length(2);
      h.expect(systems).to.have.deep.property("[0]").and.instanceOf(System);
      h.expect(systems).to.have.deep.property("[0].name", "db");
      h.expect(systems).to.have.deep.property("[1]").and.instanceOf(System);
      h.expect(systems).to.have.deep.property("[1].name", "example");
    });
  });
});
