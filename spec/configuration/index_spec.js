import h from 'spec/spec_helper';
import Configuration from 'azk/configuration';
import { ConfigurationInvalidKeyError,
         ConfigurationInvalidValueBooleanError,
         ConfigurationInvalidValueRegexError } from 'azk/utils/errors';

describe('Configuration manager:', function() {

  const KEY = 'test.key';
  let configuration = new Configuration();

  beforeEach(() => {
    configuration = new Configuration();
    configuration.remove(KEY);
  });

  it("string item", function() {
    const VALUE = 'SOME_TEXT';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'string'
    });

    // set value
    configuration.save(KEY, VALUE);

    // check
    let value = configuration.load(KEY);
    h.expect(value).to.equal(VALUE);
  });

  it("boolean item", function() {
    const VALUE = true;

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'boolean'
    });

    // set value
    configuration.save(KEY, VALUE);

    // check
    let value = configuration.load(KEY);
    h.expect(value).to.equal(VALUE);
  });

  it("validate key     : valid key", function() {
    const VALUE = 'aaa';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'string',
      validation_regex: /aaa/,
    });

    // set value
    h.expect(() => configuration.validate(KEY, VALUE))
      .to.not.throw(ConfigurationInvalidKeyError);
  });

  it("validate key     : ConfigurationInvalidKeyError", function() {
    const VALUE = 'aaa';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'string',
      validation_regex: /bbb/,
    });

    // set value
    h.expect(() => configuration.validate('invalid_key', VALUE))
      .to.throw(ConfigurationInvalidKeyError);
  });

  it("validate string  : valid value", function() {
    const VALUE = 'aaa';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'string',
      validation_regex: /aaa/,
    });

    // set value
    h.expect(() => configuration.validate(KEY, VALUE))
      .to.not.throw(ConfigurationInvalidValueRegexError);
  });

  it("validate string  : ConfigurationInvalidValueRegexError", function() {
    const VALUE = 'aaa';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'string',
      validation_regex: /bbb/,
    });

    // set value
    h.expect(() => configuration.validate(KEY, VALUE))
      .to.throw(ConfigurationInvalidValueRegexError);
  });

  it("validate boolean : valid", function() {
    const VALUE = 'on';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'boolean',
      validation_regex: /^(on|true|1|off|false|0)$/i,
    });

    // set value
    h.expect(() => configuration.validate(KEY, VALUE))
      .to.not.throw(ConfigurationInvalidValueRegexError);
  });

  it("validate boolean : ConfigurationInvalidValueBooleanError", function() {
    const VALUE = 'onn';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'boolean',
      validation_regex: /^(on|true|1|off|false|0)$/i,
    });

    // set value
    h.expect(() => configuration.validate(KEY, VALUE))
      .to.throw(ConfigurationInvalidValueBooleanError);
  });

  it("convert  boolean : convert value", function() {
    const VALUE = 'on';

    // create new test configuration
    configuration.opts._configListNames.push({
      key: KEY,
      type: 'boolean',
      validation_regex: /^(on|true|1|off|false|0)$/i,
      convertValidValueFunction: (value) => {
        if (value === 'on') {
          return true;
        }
      },
    });

    // set value
    h.expect(configuration.convertInputValue(KEY, VALUE)).to.equal(true);
  });
});
