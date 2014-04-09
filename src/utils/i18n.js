var path   = require('path');
var printf = require('printf');

function load(locale) {
  var file = path.join('locales', locale);
  return require(file);
}

export class i18n {
  constructor(opts) {
    if (typeof(opts.dict) == "object") {
      this.dict = opts.dict;
    } else if (opts.locale) {
      this.dict = load(opts.locale);
    }

    // Alias to translate
    this.t = (...args) => {
      return this.translate(...args);
    }
  }

  translate(key) {
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
}

