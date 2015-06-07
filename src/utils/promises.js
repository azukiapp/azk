var BB = require('bluebird');
var _ = require('lodash');
BB.longStackTraces();

var PromisesHelper = {
  __esModule: true,

  async(obj, func, ...args) {
    if (typeof obj == "function") {
      [func, obj] = [obj, null];
    }

    if (typeof obj == "object") {
      func = func.bind(obj);
    }

    BB.coroutine.addYieldHandler(function(yieldedValue) {
      if (typeof yieldedValue !== 'function') {
        return BB.resolve(yieldedValue);
      }
    });

    return BB.coroutine(func).apply(func, [...args]);
  },

  defer(func) {
    return new BB.Promise((resolve, reject) => {
      setImmediate(() => {
        var result;

        try {
          resolve = _.extend(resolve, { resolve: resolve, reject: reject });
          result  = func(resolve, reject);
        } catch (e) {
          return reject(e);
        }

        if (PromisesHelper.isPromise(result)) {
          result.then(resolve, reject);
        } else if (typeof(result) != "undefined") {
          resolve(result);
        }
      });
    });
  },

  asyncUnsubscribe(obj, subscription, ...args) {
    return this.async(obj, ...args)
    .then(function (result) {
      subscription.unsubscribe();
      return result;
    })
    .catch(function (err) {
      subscription.unsubscribe();
      throw err;
    });
  },

  promisifyClass(Klass) {
    if (_.isString(Klass)) {
      Klass = require(Klass);
    }

    var NewClass = function(...args) {
      Klass.call(this, ...args);
    };

    NewClass.prototype = Object.create(Klass.prototype);
    NewClass.prototype.constructor = Klass;

    _.each(_.methods(Klass.prototype), (method) => {
      var original = Klass.prototype[method];
      NewClass.prototype[method] = function(...args) {
        return BB.promisify(original.bind(this))(...args);
      };
    });

    return NewClass;
  },

  promisifyModule(mod) {
    var newMod = _.clone(mod);

    _.each(_.methods(mod), (method) => {
      var original = mod[method];
      newMod[method] = function(...args) {
        return BB.promisify(original.bind(this))(...args);
      };
    });

    return newMod;
  },

  when(previous, next) {
    return BB.cast(previous).then((result) => {
      return _.isFunction(next) ? next(result) : next;
    });
  },

  nfcall(method, ...args) {
    return BB.promisify(method)(...args);
  },

  ninvoke(obj, method, ...args) {
    return BB.promisify(obj[method].bind(obj))(...args);
  },

  nbind(obj, context) {
    return BB.promisify(obj.bind(context));
  },

  thenAll(...args) {
    return BB.all(...args);
  },

  all(...args) {
    return BB.all(...args);
  },

  delay(...args) {
    return BB.delay(...args);
  },

  isPromise(obj) {
    if (typeof obj === 'object') {
      return obj.hasOwnProperty('_promise0'); // bluebird promise
    }
    return false;
  },

  promiseResolve(...args) {
    return BB.resolve(...args);
  },

  promiseReject(...args) {
    return BB.reject(...args);
  },

  originalDefer(...args) {
    return BB.defer(...args);
  },

  promisifyAll(...args) {
    return BB.promisifyAll(...args);
  },

};

module.exports = PromisesHelper;
