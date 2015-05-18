import { lazy_require, _, path } from 'azk';

var lazy = lazy_require({
  Rsync: ['azk/agent/rsync'],
  chokidar : 'chokidar',
});

function _watch(host_folder, guest_folder, opts = {}) {
  return lazy.Rsync.sync(host_folder, guest_folder, opts)
    .then(()=> {
      _start_watcher(host_folder, guest_folder, opts);
      _send('sync', 'done');
    })
    .fail((err) => {
      _send('sync', 'fail', { err });
    });
}

function _start_watcher(host_folder, guest_folder, opts = {}) {
  var patterns_ary = _watch_patterns_ary(host_folder, opts);

  return lazy.chokidar.watch(patterns_ary, { ignoreInitial: true })
    .on('all', (event, filepath) => {
      filepath = path.relative(host_folder, filepath);

      var include = (event === 'unlinkDir') ? [`${filepath}/\*`, filepath] : filepath;
      var sync_opts = { include };
      if (opts.use_vm) {
        _.defaults(sync_opts, { use_vm: opts.use_vm, ssh: opts.ssh });
      }

      lazy.Rsync.sync(host_folder, guest_folder, sync_opts )
      .then(() => _send(event, 'done', { filepath }))
      .fail((err) => _send(event, 'fail', { filepath, err }));
    });
}

function _watch_patterns_ary(host_folder, opts = {}) {
  // TODO Support include
  opts.include = ['.'];
  opts.except  = opts.except || [];

  if (!_.isArray(opts.except)) {
    opts.except = [opts.except];
  }

  return opts.include.map((pattern) => {
    return path.resolve(host_folder, pattern);
  }).concat(opts.except.map((pattern) => {
    return '!' + path.resolve(host_folder, pattern);
  }));
}

function _send(op, status, opts = {}) {
  process.send(JSON.stringify(_.merge({ op, status }, opts)));
}

process.on('message', (data) => {
  _watch(data.host_folder, data.guest_folder, data.opts);
});
