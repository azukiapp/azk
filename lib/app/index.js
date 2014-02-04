var uuid   = require('node-uuid');
var azk    = require('../azk');
var parent = require('parentpath').sync;
var path   = require('path');

var Q = azk.Q;

var App = function() {
}

App.find_manifest = function(target) {
  var dir = azk.utils.cd(target, function() {
    return parent(azk.cst.MANIFEST);
  });
  return dir ? path.join(dir, azk.cst.MANIFEST) : null;
}

App.new_id = function() {
  return uuid.v1().replace(/-/g, "");
};

module.exports = App;
