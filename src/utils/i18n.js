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

  _find(keys) {
    var buffer = this.dict || {};

    for(var i = 0; i < keys.length; i++) {
      buffer = buffer[keys[i]];
      if (!buffer) break;
    }

    return buffer;
  }

  translate(key, ...args) {
    var keys   = (typeof(key) == "string") ? key.split('.') : key;
    var result = this._find(keys);

    // Search again, now ancestors is *
    if (!result) {
      var again_keys = new Array(...keys);
      again_keys[again_keys.length - 2] = '*';
      result = this._find(again_keys);
    }

    // Key to show in a error
    key = (typeof(key) == "string" ? key : key.join(".")).yellow;

    if (result) {
      try {
        return typeof(result) == "string" ? printf(result, ...args) : key;
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

