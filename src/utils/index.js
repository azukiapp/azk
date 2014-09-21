import { join, basename, dirname } from 'path';
import { i18n } from 'azk/utils/i18n';

var crypto = require('crypto');
var Q    = require('q');
var _    = require('lodash');
var fs   = require('fs');
var zlib = require('zlib');

var Utils = {
  get default() { return Utils },
  get i18n()    { return i18n; },
  get Q()       { return Q; },
  get _()       { return _; },
  get net()     { return require('azk/utils/net').default },
  get docker()  { return require('azk/utils/docker').default },

  envs(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  },

  cd(target, func) {
    var result, old = process.cwd();

    process.chdir(target);
    result = func();
    process.chdir(old);

    return result;
  },

  resolve(...path) {
    path = join(...path);

    // Remove file from path
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

  defer(func) {
    return Q.Promise((resolve, reject, notify) => {
      process.nextTick(() => {
        try {
          resolve = _.extend(resolve, { resolve, reject, notify });
          var result = func(resolve, reject, notify);
        } catch (e) {
          return reject(e);
        }

        if (Q.isPromise(result)) {
          result.progress(notify).then(resolve, reject);
        } else if (typeof(result) != "undefined") {
          resolve(result);
        }
      });
    });
  },

  async(obj, func, ...args) {
    return Utils.defer((_resolve, _reject, notify) => {
      if (typeof obj == "function")
        [func, obj] = [obj, null];

      if (typeof obj == "object") {
        func = func.bind(obj);
      }

      return Q.async(func)(...args, notify);
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
  },

  unzip(origin, target) {
    return Utils.defer((done) => {
      try {
        var input  = fs.createReadStream(origin);
        var output = fs.createWriteStream(target);

        output.on("close", () => done.resolve());
        input.pipe(zlib.createGunzip()).pipe(output);
      } catch (err) {
        done.reject(err);
      }
    });
  },

  deepExtend(origin, target) {
    target = _.clone(target);

    _.each(origin, (value, key) => {
      if (!_.has(target, key) || typeof(target[key]) != typeof(value)) {
        target[key] = value;
      } else if (_.isObject(target[key]) && _.isObject(value)) {
        target[key] = Utils.deepExtend(value, target[key]);
      }
    });

    return target;
  },

  calculateHash(string) {
    var shasum = crypto.createHash('sha1');
    shasum.update(string);
    return shasum.digest('hex');
  },

  escapeRegExp(value) {
    return (value || "").replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  },

  template(template, data) {
    var options = { interpolate: /(?:(?:[#|$]{|<%)[=|-]?)([\s\S]+?)(?:}|%>)/g };
    return _.template(template, data, options);
  },
};

module.exports = Utils;
