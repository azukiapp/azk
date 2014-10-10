require('traceur');
import { version } from 'package.json';
import { get as config, set as set_config }  from 'azk/config';
import { Q, _, i18n, defer, async } from 'azk/utils';

Q.longStackSupport = true;

class Azk {
  static get version() { return version };

  static pp(...args) {
    return console.log(...args);
  }
}

// Default i18n method
var t    = new i18n({ locale: config('locale') }).t;
var _log = null;

module.exports = {
  get default() { return Azk },
  get pp() { return Azk.pp; },
  get Q()  { return Q; },
  get _()  { return _; },
  get t()  { return t; },
  get config() { return config; },
  get set_config() { return set_config; },
  get defer()  { return defer; },
  get async()  { return async; },
  get os()     { return require('os'); },
  get path()   { return require('path'); },
  get fs()     { return require('fs-extra'); },
  get utils()  { return require('azk/utils'); },

  get dynamic() {
    return (obj, loads) => {
      this._.each(loads, (func, getter) => {
        obj.__defineGetter__(getter, func);
      });
    }
  },

  get log() {
    if (!_log) {
      _log = require('azk/utils/log').log;
    }
    return _log;
  },
};
