require('traceur');
import { get as config, set as set_config }  from 'azk/config';
import { Q, _, i18n, defer, async } from 'azk/utils';

Q.longStackSupport = true;

class Azk {
  static get version() {
    return require('package.json').version;
  };

  static pp(...args) {
    return console.log(...args);
  }
}

// Default i18n method
var _t   = null;
var _log = null;

module.exports = {
  __esModule: true,

  get default() { return Azk },
  get pp() { return Azk.pp; },
  get Q()  { return Q; },
  get _()  { return _; },
  get t()  {
    if (!_t) {
      _t = new i18n({
        path: this.path.join(this.config('paths:azk_root'), 'shared', 'locales'),
        locale: config('locale'),
      }).t
    }
    return _t;
  },

  // Config options
  get config()  { return config; },
  get set_config() { return set_config; },

  // Promise helpers
  get defer()   { return defer; },
  get async()   { return async; },

  // Internals alias
  get os()      { return require('os'); },
  get path()    { return require('path'); },
  get fs()      { return require('fs-extra'); },
  get utils()   { return require('azk/utils'); },
  get version() { return Azk.version; },

  get lazy_require() {
    return (obj, loads) => {
      var _ = this._;
      _.each(loads, (func, getter) => {
        if (!_.isFunction(func)) {
          var opts = func;

          // Only name module support
          if (_.isString(opts)) {
            opts = [opts];
          } else if (_.isEmpty(opts[1])) {
            opts[1] = getter;
          }

          // Require function
          func = () => {
            var mod = require(opts[0]);
            return _.isEmpty(opts[1]) ? mod : mod[opts[1]];
          }
        }
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
