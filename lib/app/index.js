var uuid   = require('node-uuid');
var azk    = require('../azk');
var parent = require('parentpath').sync;
var path   = require('path');
var fs     = require('fs');
var Box    = require('./box');
var utils  = require('../utils');

JSON.minify = JSON.minify || require("node-json-minify");
var Q = azk.Q;

function find_manifest(target) {
  var dir = azk.utils.cd(target, function() {
    return parent(azk.cst.MANIFEST);
  });
  return dir ? path.join(dir, azk.cst.MANIFEST) : null;
}

function new_id() {
  return uuid.v1().replace(/-/g, "");
}

var App = function(cwd) {
  var manifest = App.find_manifest(cwd);
  if (manifest) {
    var content = JSON.parse(
        JSON.minify(fs.readFileSync(manifest).toString())
    );

    var self = this;
    var repository = "azk/apps/" + content.id;

    self.id = content.id;
    self.content = content;
    self.repository = repository;
    self.image = repository + ':latest';
    self.path  = path.dirname(manifest);

    utils.cd(self.path, function() {
      self.from = new Box(content.box);
    });
  }
}

App.find_manifest = find_manifest;
App.new_id = new_id;
module.exports = App;
