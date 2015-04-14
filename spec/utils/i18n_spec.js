import { path, config } from 'azk';
import { i18n } from 'azk/utils';
import h from 'spec/spec_helper';

describe("Azk i18n module", function() {
  var t = new i18n({ dict: {
    key: { found: "foobar" },
    formated: "formated %s",
    array_value: ["item1", "item2"],
    wildkey: {
      '*': { 'subkey': 'value default' },
      'linux': { 'subkey': 'value linux' },
    }
  }}).t;

  it("should return a key if not found value", function() {
    var key = "key.not.found";
    h.expect(t(key)).to.equal(key.yellow);
  });

  it("should return a value for key", function() {
    h.expect(t("key.found")).to.equal("foobar");
  });

  it("should support a array as key", function() {
    h.expect(t(["key", "found"])).to.equal("foobar");
  });

  it("should support a array as value", function() {
    var result = ["item1", "item2"];
    h.expect(t("array_value")).to.eql(result);
  });

  it("should support a wild key", function() {
    h.expect(t(["wildkey", "linux", "subkey"])).to.equal("value linux");
    h.expect(t(["wildkey", "macosx", "subkey"])).to.equal("value default");
  });

  it("should support formated", function() {
    h.expect(t("formated", "foobar")).to.equal(
      "formated foobar"
    );
  });

  it("should support a load dictionary", function() {
    var i = new i18n({
      path: path.join(config('paths:azk_root'), 'shared', 'locales'),
      locale: 'en-US'
    });
    h.expect(i.t("test.i18n_test")).to.equal(
      "test i18n module"
    );
  });
});
