import { _, path, t } from 'azk';
import { defer } from 'azk/utils/promises';

// Module
export default class Sync {
  static sync(origin, destination, opts = {}) {
    let args = ['-az'];
    let include = [], exclude = [];

    if (opts.include) {
      exclude = ['*/', '*'];
      include = this._process_include(opts.include);
      include = _.map(include, this._escape_arg);
    } else {
      if (opts.except) {
        exclude = _.isArray(opts.except) ? opts.except : [opts.except];
        exclude = _.map(exclude, this._escape_arg);
      }
      if (opts.except_from) {
        args.push('--exclude-from');
        args.push(this._escape_arg(path.resolve(origin, opts.except_from)));
      }
    }

    let rsync_options = {
      args, include, exclude,
      src : this._escape_arg(path.join(origin, '/')),
      delete: true,
    };

    if (opts.ssh) {
      // Extra escape for use in ssh command
      destination = destination.replace(/(['\s\\])/g,'\\\\$1');
      destination = destination.replace(/(")/g,'\\\\\\\\$1');
      destination = destination.replace(/(`)/g,'\\\\\\$1');

      rsync_options.dest = `"${opts.ssh.url}:${destination}"`;
      rsync_options.ssh  = true;
      rsync_options.sshCmdArgs = [opts.ssh.opts];
    } else {
      rsync_options.dest = this._escape_arg(destination);
    }

    var rsync = require('rsyncwrapper');
    return defer((resolve, reject) => {
      rsync(rsync_options, (err, stdout, stderr, cmd) => {
        let result = { err, stdout, stderr, cmd, code: 0 };
        if (err) {
          result.code = err.code;
          result.err  = err.toString();
          return reject(result);
        }
        return resolve(result);
      });
    });
  }

  version() {
    var version_output = '';
    var r = new require('rsync')().set('version').output((data) => {
      version_output += data.toString();
    });
    return defer((resolve, reject) => {
      r.execute(function(err, code) {
        if (err) {
          return reject({ err, code });
        }
        var _version = version_output.match(/.*version\ (\d+\.\d+\.\d+)/);
        if (!_.isEmpty(_version) && _version.length >= 2) {
          return resolve(_version[1]);
        } else {
          return reject({
            err: t('errors.rsync_invalid_version_format', {
              rsync_version: version_output
            })
          });
        }
      });
    });
  }

  static _process_include(include) {
    if (!_.isArray(include)) { include = [include]; }

    var includes = [];
    _.each(include, (include) => {
      _.reduce(include.split('/'), (acc, p) => {
        if (acc === include) { return acc; }
        acc = acc.concat(p) === include ? acc.concat(p) : acc.concat(path.join(p, '/'));
        includes.push(acc);
        return acc;
      }, '');
    });

    return includes;
  }

  static _escape_arg(arg) {
    return `"${arg.replace(/(["`\\])/g,'\\$1')}"`;
  }
}

export { Sync };
