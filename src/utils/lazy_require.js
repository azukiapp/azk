import _ from 'lodash';

/**
 * `lazy_require` can postpone loading of external dependencies.
 * They are only loaded when they are used.
 * `lazy_require` also have some interesting syntactic sugar.
 *
 * Each object key passed can be one of the bellow forms:
 *
 * -----------------------
 * 1. { key: 'libName' }
 * Do a simple `require` from 'libName' to `lazy.key`
 *
 * @example
 * let lazy = lazy_require({ fsLib: 'fs' });
 * // lazy.fsLib === require('fs')
 *
 * -----------------------
 * 2. { propertyName: ['libName'] }
 * Require libName and return propertyName from libName to `lazy.propertyName`
 *
 * @example
 * let lazy = lazy_require({ exists: ['fs'] });
 * // lazy.exists === require('fs').exists
 *
 * -----------------------
 * 3. { key: ['libName', 'propertyName'] }
 * Require libName and return propertyName from libName to `lazy.key`
 *
 * @example
 * let lazy = lazy_require({ fsExistsFunc: ['fs', 'exists'] });
 * // lazy.fsExistsFunc === require('fs').exists
 *
 * -----------------------
 * 4. { key: function }
 * Run this function when this key is accessed. Function's return will be on `lazy.key`
 *
 * @example
 * let lazy = lazy_require({
 *   foo: function() {
 *     return new require('bar')()
 *   }
 * });
 * // lazy.foo === require('bar')
 *
 *
 * @param  {Object}    loads    Object with key-value configurations
 * @return {Object}             Lazy object to use
 */
export default function lazy_require(loads) {
  var lazy = {};
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
      };
    }
    lazy.__defineGetter__(getter, func);
  });

  return lazy;
}
