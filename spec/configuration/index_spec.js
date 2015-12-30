import h from 'spec/spec_helper';
import { config, meta as azkMeta } from 'azk';
import { Configuration } from 'azk/configuration';
import { ConfigurationInvalidKeyError,
         ConfigurationInvalidValueRegexError } from 'azk/utils/errors';

describe('Configuration manager:', function() {

  const KEY = 'test.key';
  let configuration = null;

  beforeEach(() => {
    configuration = new Configuration({ namespace: 'test_ns'});
    configuration.resetAll();
  });

  it("should append namespace in keys if is set", function() {
    configuration.save(KEY, 'foo');
    let final_key = `test_ns.${KEY}`;
    let value = azkMeta.get(final_key);
    h.expect(value).to.equal('foo');
  });

  it("should append default namespace", function() {
    let configuration = new Configuration();
    let final_key = `${config('configuration:namespace')}.${KEY}`;
    azkMeta.del(final_key);
    configuration.save(KEY, 'bar');
    let value = azkMeta.get(final_key);
    h.expect(value).to.equal('bar');
  });

  it("string item", function() {
    const VALUE = 'SOME_TEXT';

    // create new test configuration
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
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
    configuration.opts._azk_config_list.push({
      key: KEY,
      type: 'boolean',
      validation_regex: /^(on|true|1|off|false|0)$/i,
    });

    // set value
    h.expect(() => configuration.validate(KEY, VALUE))
      .to.throw().and.match(/it is not valid value/i);
  });

  it("convert  boolean : convert value", function() {
    const VALUE = 'on';

    // create new test configuration
    configuration.opts._azk_config_list.push({
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
