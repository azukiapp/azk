import h from 'spec/spec_helper';
import { Helpers } from 'azk/cli/helpers';
import { System } from 'azk/system';

describe('Azk cli helpers module', function() {
  var manifest;

  before(() => {
    var data = { };
    return h.mockManifest(data).then((mf) => {
      manifest = mf;
    });
  });

  describe("call getSystemsByName", function() {
    it("should return one system", function() {
      var systems = Helpers.getSystemsByName(manifest, "example");
      h.expect(systems[0]).to.instanceOf(System);
      h.expect(systems[0]).to.have.property("name", "example");
    });

    it("should return one or more systems", function() {
      var systems = Helpers.getSystemsByName(manifest, "example,db");
      h.expect(systems).to.length(2);
      h.expect(systems).to.have.deep.property("[0]").and.instanceOf(System);
      h.expect(systems).to.have.deep.property("[0].name", "example");
      h.expect(systems).to.have.deep.property("[1]").and.instanceOf(System);
      h.expect(systems).to.have.deep.property("[1].name", "db");
    });
  });
});
