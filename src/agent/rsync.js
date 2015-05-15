import { _, defer } from 'azk';

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
    console.log('opts', opts);
    var shell       = opts.use_vm ? `ssh ${opts.ssh.opts}` : 'sh';
    var destination = opts.use_vm ? `${opts.ssh.url}:${guest_folder}` : guest_folder;

    console.log('shell', shell);

    var r = new require('rsync')()
      .shell(shell)
      .flags('az')
      .set('delete')
      .source(host_folder)
      .destination(destination);

    if (opts.clean) {
      r.set('rsync-path', `rm -Rf ${guest_folder} && mkdir -p ${guest_folder} && rsync`);
    } else {
      r.set('rsync-path', `mkdir -p ${guest_folder} && rsync`);
    }

    var patterns = [];

    if (!_.isEmpty(opts.except)) {
      if (!_.isArray(opts.except)) {
        opts.except = [opts.except];
      }
      _.each(opts.except, (except) => {
        patterns.push({ action: '-', pattern: except });
      });
    }

    if (!_.isEmpty(opts.include)) {
      if (!_.isArray(opts.include)) {
        opts.include = [opts.include];
      }
      patterns.push({ action: '+', pattern: '*/' });
      _.each(opts.include, (include) => {
        patterns.push({ action: '+', pattern: include });
      });
      patterns.push({ action: '-', pattern: '*' });
    }

    r.patterns(patterns);

    r.execute(function(err, code, cmd) {
      console.log('running', cmd);
      if (_.isFunction(callback)) {
        callback(err, code, cmd);
      }
    });
  },

};

export { Rsync };
