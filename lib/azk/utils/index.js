"use strict";
var __moduleName = "src/utils/index";
var $__4 = require('path'),
    join = $__4.join,
    basename = $__4.basename,
    dirname = $__4.dirname;
var i18n = require('azk/utils/i18n').i18n;
var crypto = require('crypto');
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var zlib = require('zlib');
var Utils = {
  get default() {
    return Utils;
  },
  get i18n() {
    return i18n;
  },
  get Q() {
    return Q;
  },
  get _() {
    return _;
  },
  get net() {
    return require('azk/utils/net').default;
  },
  get docker() {
    return require('azk/utils/docker').default;
  },
  envs: function(key) {
    var defaultValue = arguments[1] !== (void 0) ? arguments[1] : null;
    return process.env[key] || defaultValue;
  },
  cd: function(target, func) {
    var result,
        old = process.cwd();
    process.chdir(target);
    result = func();
    process.chdir(old);
    return result;
  },
  resolve: function() {
    for (var path = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      path[$__0] = arguments[$__0];
    path = join.apply(null, $traceurRuntime.toObject(path));
    var file = "";
    var stat = fs.statSync(path);
    if (stat.isFile()) {
      file = basename(path);
      path = dirname(path);
    }
    return Utils.cd(path, function() {
      return join(process.cwd(), file);
    });
  },
  defer: function(func) {
    return Q.Promise((function(resolve, reject, notify) {
      process.nextTick((function() {
        try {
          resolve = _.extend(resolve, {
            resolve: resolve,
            reject: reject,
            notify: notify
          });
          var result = func(resolve, reject, notify);
        } catch (e) {
          return reject(e);
        }
        if (Q.isPromise(result)) {
          result.progress(notify).then(resolve, reject);
        } else if (typeof(result) != "undefined") {
          resolve(result);
        }
      }));
    }));
  },
  async: function(obj, func) {
    for (var args = [],
        $__1 = 2; $__1 < arguments.length; $__1++)
      args[$__1 - 2] = arguments[$__1];
    return Utils.defer((function(_resolve, _reject, notify) {
      var $__4;
      if (typeof obj == "function")
        ($__4 = [obj, null], func = $__4[0], obj = $__4[1], $__4);
      if (typeof obj == "object") {
        func = func.bind(obj);
      }
      return Q.async(func).apply(null, $traceurRuntime.spread(args, [notify]));
    }));
  },
  qify: function(klass) {
    if (_.isString(klass))
      klass = require(klass);
    var newClass = function() {
      var $__5;
      for (var args = [],
          $__2 = 0; $__2 < arguments.length; $__2++)
        args[$__2] = arguments[$__2];
      ($__5 = klass).call.apply($__5, $traceurRuntime.spread([this], args));
    };
    newClass.prototype = Object.create(klass.prototype);
    _.each(_.methods(klass.prototype), (function(method) {
      var original = klass.prototype[method];
      newClass.prototype[method] = function() {
        for (var args = [],
            $__3 = 0; $__3 < arguments.length; $__3++)
          args[$__3] = arguments[$__3];
        return Q.nbind(original, this).apply(null, $traceurRuntime.toObject(args));
      };
    }));
    return newClass;
  },
  qifyModule: function(mod) {
    var newMod = _.clone(mod);
    _.each(_.methods(mod), (function(method) {
      var original = mod[method];
      newMod[method] = function() {
        for (var args = [],
            $__2 = 0; $__2 < arguments.length; $__2++)
          args[$__2] = arguments[$__2];
        return Q.nbind(original, this).apply(null, $traceurRuntime.toObject(args));
      };
    }));
    return newMod;
  },
  unzip: function(origin, target) {
    return Utils.defer((function(done) {
      try {
        var input = fs.createReadStream(origin);
        var output = fs.createWriteStream(target);
        output.on("close", (function() {
          return done.resolve();
        }));
        input.pipe(zlib.createGunzip()).pipe(output);
      } catch (err) {
        done.reject(err);
      }
    }));
  },
  deepExtend: function(origin, target) {
    target = _.clone(target);
    _.each(origin, (function(value, key) {
      if (!_.has(target, key) || typeof(target[key]) != typeof(value)) {
        target[key] = value;
      } else if (_.isObject(target[key]) && _.isObject(value)) {
        target[key] = Utils.deepExtend(value, target[key]);
      }
    }));
    return target;
  },
  calculateHash: function(string) {
    var shasum = crypto.createHash('sha1');
    shasum.update(string);
    return shasum.digest('hex');
  },
  escapeRegExp: function(value) {
    return (value || "").replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  },
  template: function(template, data) {
    var options = {interpolate: /(?:(?:[#|$]{|<%)[=|-]?)([\s\S]+?)(?:}|%>)/g};
    return _.template(template, data, options);
  }
};
module.exports = Utils;
//# sourceMappingURL=index.js.map