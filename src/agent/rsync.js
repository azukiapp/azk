import { _, defer, log, path } from 'azk';

// Module
var Rsync = {
  sync(host_folder, guest_folder, opts = {}) {
    return defer((resolve, reject) => {
      this._sync(host_folder, guest_folder, opts, (err, code) => {
        if (err) {
          reject({err, code});
        }
        resolve();
      });
    });
  },

  _sync(host_folder, guest_folder, opts = {}, callback = null) {
    var shell       = opts.use_vm ? `ssh ${opts.ssh.opts}` : '/bin/bash';
    var destination = opts.use_vm ? `${opts.ssh.url}:${guest_folder}` : guest_folder;

    var r = new require('rsync')()
      .shell(shell)
      .flags('az')
      .set('delete')
      .source(host_folder)
      .destination(destination);

    if (opts.include) {
      if (!_.isArray(opts.include)) { opts.include = [opts.include]; }

      var includes = [];
      _.each(opts.include, (include) => {
        _.reduce(include.split('/'), (acc, p) => {
          if (acc === include) { return acc; }
          acc = acc.concat(p) === include ? acc.concat(p) : acc.concat(path.join(p, '/'));
          includes.push(acc);
          return acc;
        }, '');
      });

      r.include(includes);
      r.exclude(['*/', '*']);
    } else {
      r.exclude(opts.except);
      if (opts.except_from) {
        r.set('exclude-from', opts.except_from);
      }
    }

    r.execute(function(err, code, cmd) {
      log.debug('SSH Command: ', cmd);
      if (_.isFunction(callback)) {
        callback(err, code, cmd);
      }
    });
  },

};

export { Rsync };
