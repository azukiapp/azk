var path   = require('path');
var printf = require('printf');

var locale_path = path.join(__dirname, '..', 'locales');
var dictionary = {};

function load(locale) {
  var file = path.join(locale_path, locale);
  return require(file);
}

function i18n(opts) {
  var self = this;

  if (typeof(opts.dict) == "object") {
    self.dict = opts.dict;
  } else if (opts.locale) {
    self.dict = load(opts.locale);
  }

  self.t = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    return self.translate.apply(self, args);
  };
}

i18n.prototype.translate = function(key) {
  var keys   = key.split('.');
  var buffer = this.dict || {};

  for(var i = 0; i < keys.length; i++) {
    buffer = buffer[keys[i]];
    if (!buffer) break;
  }

  if (buffer) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(buffer)
    return printf.apply(this, args);
  }
  return key;
}

module.exports = i18n;
