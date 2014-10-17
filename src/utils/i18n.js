require('colors');
var path   = require('path');
var printf = require('printf');

function load(folder, locale) {
  var file = path.join(folder, locale);
  return require(file);
}

export class i18n {
  constructor(opts) {
    if (typeof(opts.dict) == "object") {
      this.dict = opts.dict;
    } else if (opts.locale) {
      this.dict = load(opts.path, opts.locale);
    }

    // Alias to translate
    this.t = (...args) => {
      return this.translate(...args);
    }
  }

  translate(key, ...args) {
    var keys   = (typeof(key) == "string") ? key.split('.') : key;
    var buffer = this.dict || {};

    for(var i = 0; i < keys.length; i++) {
      buffer = buffer[keys[i]];
      if (!buffer) break;
    }

    key = (typeof(key) == "string" ? key : key.join(".")).yellow;

    if (buffer) {
      try {
        return typeof(buffer) == "string" ? printf(buffer, ...args) : buffer;
      } catch (err) {
        var match, label = "Translate error".red;

        if (match = err.toString().match(/Error: missing key (.*)/)) {
          return label + `: '${key}', missing: ${match[1]}`;
        }

        if (match = err.toString().match(/Error: format requires a mapping/)) {
          return label + `: '${key}', missing a mappping`;
        }

        throw err;
      }
    } else {
      return key;
    }
  }
}

