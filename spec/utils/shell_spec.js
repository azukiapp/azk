import h from 'spec/spec_helper';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  replaceEnvs : ['azk/utils/shell'],
});

describe("Azk utils/shell module", function() {
  describe("call replaceEnvs", function() {
    it("should expand env in a string", function() {
      var result;

      result = lazy.replaceEnvs("${PATH}");
      h.expect(result).to.equal("PATH");

      result = lazy.replaceEnvs("${PATH} AZK_ID");
      h.expect(result).to.equal("PATH AZK_ID");

      result = lazy.replaceEnvs("${PATH} $AZK_ID");
      h.expect(result).to.equal("PATH AZK_ID");

      result = lazy.replaceEnvs('foo \\\\${BAR}');
      h.expect(result).to.equal('foo \\\\BAR');
    });

    it("should support replace_for", function() {
      var result = lazy.replaceEnvs("foo: ${BAR}", "${env.$1}");
      h.expect(result).to.equal("foo: ${env.BAR}");
    });

    it("should not replace if not have a var", function() {
      var result = lazy.replaceEnvs("foo bar");
      h.expect(result).to.equal("foo bar");
    });

    it("should ignore special", function() {
      var result;

      result = lazy.replaceEnvs("${1} $AZK_ID");
      h.expect(result).to.equal("${1} AZK_ID");

      result = lazy.replaceEnvs("${@} $AZK_ID");
      h.expect(result).to.equal("${@} AZK_ID");

      result = lazy.replaceEnvs("$? $AZK_ID");
      h.expect(result).to.equal("$? AZK_ID");
    });

    it("should support escaped vars with slash", function() {
      var result;

      result = lazy.replaceEnvs('foo \\${BAR}');
      h.expect(result).to.equal('foo ${BAR}');

      result = lazy.replaceEnvs('foo \\ ${BAR}');
      h.expect(result).to.equal('foo \\ BAR');

      result = lazy.replaceEnvs('foo \\\\\\${BAR}');
      h.expect(result).to.equal('foo \\\\${BAR}');

      result = lazy.replaceEnvs('foo \\$BAR ${FOO}');
      h.expect(result).to.equal('foo $BAR FOO');
    });

    it("should support escaped in json", function() {
      var result;

      result = lazy.replaceEnvs(JSON.stringify('foo \\${BAR}'), "$1", true);
      h.expect(JSON.parse(result)).to.equal('foo ${BAR}');
    });
  });
});
