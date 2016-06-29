import { _, path, t } from 'azk';
import { defer } from 'azk/utils/promises';
import { which } from 'azk/utils';
import { spawnAsync } from 'azk/utils/spawn_helper';
import { stat } from 'file-async';

function wrap(value) {
  if (_.isArray(value)) { return value; }
  if (!_.isEmpty(value)) { return [value]; }
  return value;
}

const SEP = path.sep;

// Module
export default class Sync {
  static sync(origin, destination, opts = {}) {
    return stat(origin).then((stats) => {
      let args = ['-az'];
      let include = [], exclude = [];
      let DIR_SEP = '';

      if (!stats.isFile()) {
        DIR_SEP = SEP;
        include = wrap(opts.include || []);
        exclude = wrap(opts.except || []);

        if (opts.except_from) {
          args.push('--exclude-from');
          args.push(this._escape_arg(path.resolve(origin, opts.except_from)));
        }
      }

      if (!_.isEmpty(opts.relative_sufix)) {
        let relative = path.relative(opts.relative_sufix, origin);
        origin = `${opts.relative_sufix}${SEP}.${SEP}${relative}`;
        args.push('--relative');
        let fix_relatives = (item) => {
          item = (item.match(/^\//)) ? path.join(SEP, relative, item) : item;
          return item;
        };
        include = _.map(include, fix_relatives);
        exclude = _.map(exclude, fix_relatives);
      }

      include = _.map(include, this._escape_arg);
      exclude = _.map(exclude, this._escape_arg);

      let rsync_options = {
        args, include, exclude,
        src : this._escape_arg(`${origin}${DIR_SEP}`),
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

      return this.rsync(rsync_options);
    });
  }

  static rsync(rsync_options) {
    var rsync = require('rsyncwrapper');
    return defer((resolve, reject) => {
      rsync(rsync_options, (err, stdout, stderr, cmd) => {
        // console.log(cmd);
        let result = { stdout, stderr, cmd, code: 0 };
        if (err) {
          result.code = err.code;
          return reject(_.assign(err, result));
        }
        return resolve(result);
      });
    });
  }

  static version() {
    return which('rsync')
    .then((fullpath) => {
      return spawnAsync(fullpath, ['--version']);
    })
    .then(({error_code, message}) => {
      if (error_code !== 0) {
        throw { err: message, code: error_code };
      }

      var _version = message.match(/.*version\ (\d+\.\d+\.\d+)/);
      if (!_.isEmpty(_version) && _version.length >= 2) {
        return _version[1];
      } else {
        throw({
          err: t('errors.rsync_invalid_version_format', { rsync_version: message })
        });
      }
    });
  }

  static _escape_arg(arg) {
    return `"${arg.replace(/(["`\\])/g,'\\$1')}"`;
  }
}

export { Sync };
