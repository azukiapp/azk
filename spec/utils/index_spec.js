import h from 'spec/spec_helper';
import utils from 'azk/utils';

var { join } = require('path');

describe("Azk utils module", function() {
  it("should run function in cwd", function() {
    var current = process.cwd();
    var other = null;
    utils.cd(__dirname, () => {
      other = process.cwd();
    });
    h.expect(current).to.not.equal(other);
    h.expect(current).to.equal(process.cwd());
    h.expect(other).to.equal(__dirname);
  });

  it("should resolve a directory path", function() {
    var result = utils.resolve('./', '../');
    h.expect(result).to.equal(join(process.cwd(), '..'));
  });

  it("should resolve a file path", function() {
    var result = utils.resolve('./', 'bin', 'azk');
    h.expect(result).to.equal(join(process.cwd(), 'bin', 'azk'));
  });

  it("should escape string with special regex characters", function() {
    var string = "-\\[]{}()*+?.,^$|#";
    var func = () => string.match(RegExp(string));
    h.expect(func).to.throw(SyntaxError);
    h.expect(string).to.match(RegExp(utils.escapeRegExp(string)));
  });

  it("should expand templae", function() {
    var result, data = { value: "foo", hash: { key: "bar" } };
    result = utils.template("<%= value %> - #{hash.key}", data);
    h.expect(result).to.equal("foo - bar");
  });

  describe('envs', function () {
    beforeEach(() => {
      delete process.env.ENV_TEST;
    });

    describe('without default, should', function () {
      it('null from "null"', function () {
        var key = 'ENV_TEST';
        process.env[key] = 'null';
        h.expect(utils.envs(key)).to.eql(null);
      });

      it('null from "undefined"', function () {
        var key = 'ENV_TEST';
        process.env[key] = 'undefined';
        h.expect(utils.envs(key)).to.eql(undefined);
      });

      it('null from "false"', function () {
        var key = 'ENV_TEST';
        process.env[key] = 'false';
        h.expect(utils.envs(key)).to.eql(false);
      });

      it('should true', function () {
        var key = 'ENV_TEST';
        process.env[key] = 'true';
        h.expect(utils.envs(key)).to.eql(true);
      });
    });

    describe('with default, should "default_value"', function () {
      var should = "default_value";

      it('should undefined', function () {
        var key = 'ENV_TEST';
        process.env[key] = 'undefined';
        h.expect(utils.envs(key, should)).to.eql(should);
      });

      it('should false from "false"', function () {
        var key = 'ENV_TEST';
        process.env[key] = 'false';
        h.expect(utils.envs(key, should)).to.eql(false);
      });

      it('default from undefined env', function () {
        var key = 'ENV_TEST';
        h.expect(utils.envs(key, should)).to.eql(should);
      });
    });
  });
});
