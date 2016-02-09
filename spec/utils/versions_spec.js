import h from 'spec/spec_helper';
import { Versions } from 'azk/utils';

describe("Azk Utils Versions", function() {
  describe('parse version,', function () {
    it("should error not regexp", function() {
      var func = () => Versions.parse(null);
      h.expect(func).to.throw(Error, /Cannot call method \'match\' of null/);
    });

    it("should invalid version from empty string", function() {
      var result = Versions.parse('');
      h.expect(result).to.be.null;
    });

    it("should one version by special chars", function() {
      h.expect(Versions.parse('~> 1.0'     )).to.eql('1.0.0');
      h.expect(Versions.parse('~> 1.2.9'   )).to.eql('1.2.9');
      h.expect(Versions.parse('~> 1.3-beta')).to.eql('1.3.0');
    });

    it("should multiple versions by context", function() {
      h.expect(Versions.parse('1.0 1.2'          )).to.eql('1.0.0');
      h.expect(Versions.parse('1.0.1 or 1.2.3'   )).to.eql('1.0.1');
      h.expect(Versions.parse('1.0.4 or 1.2-beta')).to.eql('1.0.4');
    });
  });

  describe('match version,', function () {
    // https://regex101.com/r/jQ6eE8/3
    var regex = /elixir[\s]*\:[\s]*\"(?:[~> ]*)?([0-9.]+)(?:(?:[or ]*)?([0-9.]+))?(?:.*)?\".*/gm;

    it("should error not regexp", function() {
      var func = () => Versions.match(null, '');
      h.expect(func).to.throw(Error, /regex .* is not instance of \`RegExp\`/);
    });

    it("should invalid version from empty string", function() {
      var result = Versions.match(regex, '');
      h.expect(result).to.not.be.undefined;
    });

    it("should one version by context", function() {
      h.expect(Versions.match(regex, 'elixir: "~> 1.0",'     )).to.eql(['1.0.0']);
      h.expect(Versions.match(regex, 'elixir: "~> 1.2.9",'   )).to.eql(['1.2.9']);
      h.expect(Versions.match(regex, 'elixir: "~> 1.3-beta",')).to.eql(['1.3.0']);
    });

    it("should multiple versions by context", function() {
      h.expect(Versions.match(regex, 'elixir: "~> 1.0 or 1.2",'       )).to.eql(['1.0.0', '1.2.0']);
      h.expect(Versions.match(regex, 'elixir: "~> 1.0.1 or 1.2.3",'   )).to.eql(['1.0.1', '1.2.3']);
      h.expect(Versions.match(regex, 'elixir: "~> 1.0.4 or 1.2-beta",')).to.eql(['1.0.4', '1.2.0']);
    });
  });
});
