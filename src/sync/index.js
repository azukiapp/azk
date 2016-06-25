import { _, path, t } from 'azk';
import { defer } from 'azk/utils/promises';

// Module
var Sync = {
  sync(origin, destination, opts = {}) {
    let args = ['-az'];
    let include = [], exclude = [];

    if (opts.include) {
      include = this._process_include(opts.include);
      exclude = ['*/', '*'];
    } else {
      if (opts.except) {
        exclude = _.isArray(opts.except) ? opts.except : [opts.except];
      }
      if (opts.except_from) {
        args.push('--exclude-from');
        args.push(path.resolve(origin, opts.except_from));
      }
    }

    origin = origin.replace(/(["`\\])/g,'\\$1');
    destination = destination.replace(/(['\s\\])/g,'\\\\$1');
    destination = destination.replace(/(")/g,'\\\\\\\\$1');
    destination = destination.replace(/(`)/g,'\\\\\\$1');

    let rsync_options = {
      args, include, exclude,
      src : `"${path.join(origin, '/')}"`,
      delete: true,
    };

    if (opts.ssh) {
      destination = `"${opts.ssh.url}:${destination}"`;
      rsync_options.ssh  = true;
      rsync_options.sshCmdArgs = [opts.ssh.opts];
    }

    rsync_options.dest = `${destination}`;

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
  },

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
  },

  _process_include(include) {
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

};

export { Sync };
