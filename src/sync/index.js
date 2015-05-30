import { _, defer, log, path, t } from 'azk';

// Module
var Sync = {
  sync(origin, destination, opts = {}) {
    var shell   = opts.ssh ? `ssh ${opts.ssh.opts}` : '/bin/bash';
    destination = opts.ssh ? `${opts.ssh.url}:${destination}` : destination;

    var r = new require('rsync')()
      .shell(shell)
      .flags('az')
      .set('delete')
      .source(path.join(origin, '/'))
      .destination(destination);

    if (opts.include) {
      r.include(this._process_include(opts.include));
      r.exclude(['*/', '*']);
    } else {
      if (opts.except) { r.exclude(opts.except); }
      if (opts.except_from) {
        r.set('exclude-from', path.resolve(origin, opts.except_from));
      }
    }

    return defer((resolve, reject) => {
      r.execute(function(err, code, cmd) {
        log.debug('[sync] rsync command:', cmd);
        if (err) {
          err = err.stack ? err.stack : err.toString();
          log.error('[sync] fail', err);
          return reject({ err, code });
        }
        return resolve(code);
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
