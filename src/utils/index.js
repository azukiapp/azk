
import { join } from 'path';
var Q = require('q');
var _ = require('underscore');

var Utils = {
  cd(target, func) {
    var result, old = process.cwd();

    process.chdir(target);
    result = func();
    process.chdir(old);

    return result;
  },

  resolve(...path) {
    return Utils.cd(join(...path), function() {
      return process.cwd();
    });
  },

  netCalcIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.1");
  },

  qify(klass) {
    if (_.isString(klass))
      klass = require(klass);

    var newClass = function(...args) {
      klass.call(this, ...args);
    }

    newClass.prototype = Object.create(klass.prototype);

    _.each(_.methods(klass.prototype), (method) => {
      var original = klass.prototype[method];
      newClass.prototype[method] = function(...args) {
        return Q.nbind(original, this)(...args);
      };
    });

    return newClass;
  },

  qifyModule(mod) {
    var newMod = _.clone(mod);

    _.each(_.methods(mod), (method) => {
      var original = mod[method];
      newMod[method] = function(...args) {
        return Q.nbind(original, this)(...args);
      };
    });

    return newMod;
  }
};

export default Utils;
export { i18n } from 'azk/utils/i18n';
export { Q, _ };
