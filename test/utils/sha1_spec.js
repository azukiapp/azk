var helper = require('../spec_helper.js');
var sha1   = require('../../lib/utils/sha1');
var azk    = require('../../lib/azk');
var expect = helper.expect;

describe("Azk utils sha1", function() {
  it("should calculate a sha1 for path", function(done) {
    var box_path = helper.fixture_path("test-box");
    sha1.calculate(box_path).then(function(hash) {
      expect(hash).to.match(/^\w{40}$/)
    }).then(done).fail(done);
  });
});
