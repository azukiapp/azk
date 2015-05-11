import { defer, lazy_require, _, path } from 'azk';

var lazy = lazy_require({
  Worker: ['webworker-threads'],
  rsync: 'rsync',
  gaze  : 'gaze'
});

// Module
var Rsync = {
  sync(host_folder, guest_folder) {
    return defer((resolve, reject) => {
      this._sync(host_folder, guest_folder, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },

  watch(host_folder, guest_folder, opts = {}) {
    var patterns_ary = this._watch_patterns_ary(host_folder, opts);

    lazy.gaze(patterns_ary, {cwd: host_folder}, (err, watcher) => {
 
      watcher.on('all', (event, filepath) => {
        var from, to, callback;
        if (event === 'deleted') {
          [from, to] = [host_folder, guest_folder];
          callback = (err) => {
            if (err) {
              console.log(err);
            }
            console.log(filepath, 'deleted.');
          };
        } else {
          from = filepath;
          var normalized_host_folder = path.join(host_folder, '/');
          var normalized_guest_folder = path.join(guest_folder, '/');
          to = normalized_guest_folder.replace(normalized_host_folder, '') + filepath;
          callback = (err) => {
            if (err) {
              console.log(err);
            }
            console.log(filepath, 'synced.');
          };
        }
        this._sync(from, to, callback);
      });

    });
  },

  _sync(host_folder, guest_folder, callback) {
    var r = new lazy.rsync()
      .shell('sh')
      .flags('az')
      .set('rsync-path', `mkdir -p ${guest_folder} && rsync`)
      .set('delete')
      .source(host_folder)
      .destination(guest_folder);

    r.execute(function(err, code, cmd) {
      if (callback) {
        callback(err, code, cmd);
      }
    });
  },

  _watch_patterns_ary(host_folder, opts = {}) {
    opts = _.defaults(opts, {
      include: ['**/*'],
      except : []
    });

    if (!_.isEmpty(opts.include) && !_.isArray(opts.include)) {
      opts.include = [opts.include];
    }
    if (!_.isEmpty(opts.except) && !_.isArray(opts.except)) {
      opts.except = [opts.except];
    }

    var patterns_ary = opts.include.concat(opts.except.map((e) => {
      return '!' + e;
    }));

    return patterns_ary;
  }

};

export { Rsync };
