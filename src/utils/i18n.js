require('colors');
var path   = require('path');
var printf = require('printf');

function load(folder, locale) { // jshint ignore:line
  var file = path.join(folder, locale);
  return require(file);
}

export class i18n {
  /* jshint ignore:start */
  constructor(opts, ...args) {
    if (typeof(opts.dict) == "object") {
      this.dict = opts.dict;
    } else if (opts.locale) {
      this.dict = load(opts.path, opts.locale);
    }

    // Alias to translate
    this.t = (...args) => {
      return this.translate(...args);
    };
  }
  /* jshint ignore:end */

  _find(keys) {
    var buffer = this.dict || {};

    for (var i = 0; i < keys.length; i++) {
      buffer = buffer[keys[i]];
      if (!buffer) {
        break;
      }
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
        switch (typeof(result)) {
          case "string":
            return printf(result, ...args);
          case "object":
            return result;
          default:
            return key;
        }
      } catch (err) {
        var match, label = "Translate error".red;
        match = err.toString().match(/Error: missing key (.*)/);
        if (match) {
          return label + `: '${key}', missing: ${match[1]}`;
        }

        match = err.toString().match(/Error: format requires a mapping/);
        if (match) {
          return label + `: '${key}', missing a mappping`;
        }

        throw err;
      }
    } else {
      return key;
    }
  }
}
