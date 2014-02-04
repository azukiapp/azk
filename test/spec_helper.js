var path   = require('path');
var azk    = require('../lib/azk');
var chai   = require('chai');
var tmp    = require('tmp');

// Shortcuts
var Q = azk.Q;

// Extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));

// Remove tmp
tmp.setGracefulCleanup();

// Global setups
before(function() {
  return azk.init();
});

module.exports = {
  azk: azk,
  tmp: {
    dir: Q.denodeify(tmp.dir),
  },
  expect: chai.expect,
  fixture_path: function(fixture) {
    return path.resolve(
      path.join(__dirname, "fixtures", fixture)
    );
  }
}
