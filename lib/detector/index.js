var glob = require('glob');
var path = require('path');
var mu   = require('mustache');
var fs   = require('fs');

var azk  = require('../azk');
var _    = azk._;

var template = path.join(
    __dirname, 'azkfile.mustach.json'
);

var files = glob.sync("detectors/*.js", { cwd: __dirname });
var rules = _.map(files, function(role) {
  return require(path.join(__dirname, role));
});

var Detector = module.exports = {}

Detector.inspect = function(dir) {
  var result = null;

  _.some(rules, function(rule) {
    return result = rule.detect(dir);
  });

  return result;
}

Detector.render  = function(data, file) {
  var tpl    = fs.readFileSync(template).toString();
  fs.writeFileSync(file, mu.render(tpl, data));
}
