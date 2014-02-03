var path   = require('path');
var azk    = require('../lib/azk');
var chai   = require('chai');

// Extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));

module.exports = {
  azk: azk,
  expect: chai.expect,
  fixture_path: function(fixture) {
    return path.resolve(
      path.join(__dirname, "fixtures", fixture)
    );
  }
}
