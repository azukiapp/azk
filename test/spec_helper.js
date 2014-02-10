var path   = require('path');
var azk    = require('../lib/azk');
var chai   = require('chai');
var tmp    = require('tmp');
var docker = require('../lib/docker');
var Agent  = require('../lib/agent');

// Shortcuts
var Q = azk.Q;
var _ = azk._;

// Extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));

// Remove tmp
tmp.setGracefulCleanup();

// Global setups
before(function() {
  return azk.init().then(function() {
    var done = Q.defer();

    process.on('agent:client:ready', function() {
      done.resolve(Q.fcall(function() {
        done.resolve();
      }));
    });

    Agent.start();

    return done.promise;
  });
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
