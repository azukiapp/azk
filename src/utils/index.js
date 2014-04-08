
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
  }
};

export default Utils;
export { Q, _ };
