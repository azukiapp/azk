"use strict";
var __moduleName = "src/utils/capture_io";
var $__0 = require('azk/utils'),
    Q = $__0.Q,
    _ = $__0._;
var StdOutFixture = require('fixture-stdout');
var fixtures = {
  stdout: new StdOutFixture(),
  stderr: new StdOutFixture({stream: process.stderr})
};
function capture_io(block) {
  return Q.when(null, (function() {
    var writes = {
      stdout: '',
      stderr: ''
    };
    _.each(fixtures, (function(fixture, key) {
      fixture.capture((function(string, encoding, fd) {
        writes[key] += string;
        return false;
      }));
    }));
    var fail = (function(err) {
      _.each(fixtures, (function(fixture) {
        return fixture.release();
      }));
      throw err;
    });
    try {
      var result = block();
    } catch (err) {
      return fail(err);
    }
    ;
    return Q.when(result, (function(value) {
      _.each(fixtures, (function(fixture) {
        return fixture.release();
      }));
      return [value, writes];
    }), fail);
  }));
}
var $__default = capture_io;
module.exports = {
  get default() {
    return $__default;
  },
  __esModule: true
};
//# sourceMappingURL=capture_io.js.map