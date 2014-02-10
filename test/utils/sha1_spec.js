var helper = require('../spec_helper.js');
var sha1   = require('../../lib/utils/sha1');
var azk    = require('../../lib/azk');
var touch  = require('touch');
var path   = require('path');

var expect = helper.expect;

describe.only("Azk utils sha1", function() {
  var box_path = helper.fixture_path("test-box");

  it("should calculate a sha1 for path", function() {
    return expect(sha1.calculate(box_path)).to.eventually.match(/^\w{40}$/)
  });

  it("should rais exception if path not a directory", function() {
    return expect(sha1.calculate(__filename))
      .to.eventually.rejectedWith(Error, /Source .* not is a directory/);
  });

  it("should calculate sync mode", function() {
    var hash = sha1.calculateSync(box_path);
    expect(hash).to.match(/^\w{40}$/);

    touch(path.join(box_path, 'scripts', 'node'));
    expect(hash).to.not.equal(sha1.calculateSync(box_path));
  });
});
