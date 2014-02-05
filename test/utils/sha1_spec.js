var helper = require('../spec_helper.js');
var sha1   = require('../../lib/utils/sha1');
var azk    = require('../../lib/azk');
var expect = helper.expect;

describe("Azk utils sha1", function() {
  it("should calculate a sha1 for path", function() {
    var box_path = helper.fixture_path("test-box");
    return expect(sha1.calculate(box_path)).to.eventually.match(/^\w{40}$/)
  });

  it("should rais exception if path not a directory", function() {
    return expect(sha1.calculate(__filename))
      .to.eventually.rejectedWith(Error, /Source .* not is a directory/);
  });
});
