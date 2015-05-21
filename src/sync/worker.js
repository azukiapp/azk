import { _, lazy_require, path, log } from 'azk';
import { defer } from 'azk';

var lazy = lazy_require({
  Sync     : ['azk/sync'],
  chokidar : 'chokidar',
  fs       : 'fs'
});

export class Worker {
  constructor(process) {
    this.process = process;
    this.process.on('message', (data) => {
      this.watch(data.origin, data.destination, data.opts);
    });

    this.chok = null;
  }

  watch(origin, destination, opts = {}) {
    this.unwatch();

    log.debug('[sync] call to watch and sync: %s => %s', origin, destination);
    return this._check_origin(origin)
      .then(() => {
        return lazy.Sync.sync(origin, destination, opts);
      })
      .then(() => {
        this._send('sync', 'done');
      })
      .then(() => {
        return this._start_watcher(origin, destination, opts);
      })
      .then(() => {
        this._send('watch', 'ready');
      })
      .fail((err) => {
        log.error('[sync] fail', (err.stack ? err.stack : err.toString()));
        this._send('sync', 'fail', { err });
      });
  }

  unwatch() {
    if (!_.isEmpty(this.chok)) {
      this._send('sync', 'close');
      this.chok.close();
      this.chok = null;
    }
  }

  _start_watcher(origin, destination, opts = {}) {
    var patterns_ary = this._watch_patterns_ary(origin, opts);

    return defer((resolve, reject) => {
      this.chok = lazy.chokidar.watch(patterns_ary, { ignoreInitial: true })
        .on('all', (event, filepath) => {
          filepath = path.relative(origin, filepath);

          var include = (event === 'unlinkDir') ? [`${filepath}/\*`, filepath] : [ filepath ];
          var sync_opts = { include, ssh: opts.ssh || null };

          log.debug('[sync]', event, 'file', filepath);

          lazy.Sync
            .sync(origin, destination, sync_opts )
            .then(() => this._send(event, 'done', { filepath }))
            .fail((err) => this._send(event, 'fail', _.merge(err, { filepath })));
        })
        .on('ready', () => resolve(true))
        .on('error', (err) => reject(err));
    });
  }

  _watch_patterns_ary(origin, opts = {}) {
    // TODO Support include
    opts.include = ['.'];
    opts.except  = opts.except || [];

    if (!_.isArray(opts.except)) {
      opts.except = [opts.except];
    }

    return opts.include.map((pattern) => {
      return path.resolve(origin, pattern);
    }).concat(opts.except.map((pattern) => {
      return '!' + path.resolve(origin, pattern);
    }));
  }

  _send(op, status, opts = {}) {
    this.process.send(JSON.stringify(_.merge({ op, status }, opts)));
  }

  _check_origin(origin) {
    return defer((resolve, reject) => {
      try {
        lazy.fs.exists(origin, (exists) => {
          var err = exists ? null : { err: 'Sync: origin path not exist', code: 101 };
          return err ? reject(err) : resolve(true);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

//
// If this file is a main process, it means that
// this process is being forked by azk itself
//
if (require.main === module) {
  process.title = 'azk: sync worker';
  log.debug('[sync]', "sync worker spawned");
  new Worker(process);
}
