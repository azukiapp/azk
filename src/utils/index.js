import { join } from 'path';
import _ from 'lodash';
import fs from 'fs';
import { defer, nfcall } from './promises';
import lazy_require from './lazy_require';

var Utils = {
  get default () { return Utils; },
  get _       () { return _; },
  get net     () { return require('azk/utils/net'); },
  get docker  () { return require('azk/utils/docker'); },
  get Versions() { return require('azk/utils/versions'); },

  lazy_require: lazy_require,

  envs(key, defaultValue) {
    var value = process.env[key];
    switch (value) {
      case 'undefined':
        value = undefined;
        break;
      case 'null':
        value = null;
        break;
      case 'false':
        value = false;
        break;
      case 'true':
        value = true;
        break;
    }
    if (_.isUndefined(value)) {
      return (_.isFunction(defaultValue) ? defaultValue() : defaultValue);
    } else {
      return value;
    }
  },

  mergeConfig(options) {
    _.each(options, (values, key) => {
      if (key != '*') {
        options[key] = _.merge({}, options['*'], values);
      }
    });
    return options;
  },

  which(command) {
    return nfcall(require('which'), command);
  },

  cd(target, func) {
    var result, old = process.cwd();

    process.chdir(target);
    result = func();
    process.chdir(old);

    return result;
  },

  resolve(...path) {
    return fs.realpathSync(join(...path));
  },

  unzip(origin, target) {
    return defer((done) => {
      try {
        var input  = fs.createReadStream(origin);
        var output = fs.createWriteStream(target);

        var unzip = require('zlib').createGunzip();
        unzip.on('error', function (err) {
          done.reject(err);
        });
        output.on("close", done.resolve);

        input.pipe(unzip).pipe(output);
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
    var shasum = require('crypto').createHash('sha1');
    shasum.update(string);
    return shasum.digest('hex');
  },

  escapeRegExp(value) {
    return (value || "").replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  },

  template(template_string, data) {
    var options = { interpolate: /(?:(?:[#|$]{|<%)[=|-]?)([\s\S]+?)(?:}|%>)/g };
    return _.template(template_string, options)(data);
  },

  isBlank(obj) {
    return _.isNull(obj) ||
           _.isUndefined(obj) ||
           obj === false;
  },

  envDefaultArray(key, defaultValue) {
    var value = Utils.envs(key);
    return (!value || _.isEmpty(value)) ? defaultValue : _.invoke(value.split(','), 'trim');
  },

  // Regex reference: https://regex101.com/r/iW6qX3/11
  splitCmd(command) {
    var regex  = /([^\s'"]*"[^\\"\n]*(\\["\\][^\\"\n]*)*")|([^\s"']*'[^\\'\n]*(\\['\\][^\\'\n]*)*')|([^'"\n\s]*)/g;
    var pieces = command.match(regex);
    return _.compact(pieces);
  },

  joinCmd(command) {
    if (_.isArray(command)) {
      if (command.length > 1) {
        command = _.map(command, (arg) => {
          return (arg.match(/['|"|\s]/)) ? `"${arg.replace(/(")/g, "\\$1")}"` : arg;
        });
      }
      command = command.join(" ");
    }
    return command;
  },

  requireArray(value) {
    return _.compact(_.isArray(value) ? value : [value]);
  },

  deviceInfo() {
    let os = require('os');
    return {
      "os"          : require('os-name')(),
      "proc_arch"   : os.arch(),
      "total_memory": Math.floor(os.totalmem() / 1024 / 1024),
      "cpu_info"    : os.cpus()[0].model,
      "cpu_count"   : os.cpus().length
    };
  },

};

export default Utils;
