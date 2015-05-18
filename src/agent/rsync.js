import { _, async, defer, path, log } from 'azk';

var qfs = require('q-io/fs');

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
    return async(this, function* () {
      var shell       = opts.use_vm ? `ssh ${opts.ssh.opts}` : '/bin/bash';
      var destination = opts.use_vm ? `${opts.ssh.url}:${guest_folder}` : guest_folder;

      var r = new require('rsync')()
        .shell(shell)
        .flags('az')
        .set('delete')
        .source(host_folder)
        .destination(destination);

      var excludes = (opts.except || []).concat(['.gitignore', '.azk/', '.git/', 'Azkfile.js']);
      r.exclude(excludes);

      var rsyncignore = path.join(host_folder, '.rsyncignore');
      var exists = yield qfs.exists(rsyncignore);
      if (exists) {
        r.set('exclude-from', rsyncignore);
      }

      r.execute(function(err, code, cmd) {
        log.debug('SSH Command: ', cmd);
        if (_.isFunction(callback)) {
          callback(err, code, cmd);
        }
      });
    });
  },

};

export { Rsync };
