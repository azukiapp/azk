import { _, lazy_require, path, log, fsAsync } from 'azk';
import { defer, async } from 'azk/utils/promises';

var lazy = lazy_require({
  Sync     : ['azk/sync'],
  chokidar : 'chokidar'
});

export class Worker {
  constructor(process) {
    this.process = process;
    this.process.on('message', (data) => {
      process.title = "azk sync worker " + data.origin + " " + data.destination;
      this.watch(data.origin, data.destination, data.opts).then(() => {}, () => {});
    });

    this.chok = null;
  }

  watch(origin, destination, opts = {}) {
    this.unwatch();

    log.debug('[sync] call to watch and sync: %s => %s', origin, destination);
    return async(this, function* () {
      try {
        var exists = yield fsAsync.exists(origin);
        if (!exists) {
          throw { err: 'Sync: origin path not exist', code: 101 };
        }

        var stats = yield fsAsync.stat(origin);
        if (!(stats.isDirectory || stats.isFile() || stats.isSymbolicLink())) {
          throw new Error(`The type of the file ${origin} is not supported for synchronization`);
        }

        if (stats.isDirectory()) {
          opts = yield this._check_for_except_from(origin, opts);
        }

        yield lazy.Sync.sync(origin, destination, opts);
        this._send('sync', 'done');
        yield this._start_watcher(origin, destination, opts);
        this._send('watch', 'ready');
      } catch (err) {
        log.error('[sync] fail', (err.stack ? err.stack : err.toString()));
        this._send('sync', 'fail', { err });
        throw err;
      }
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
      this.chok = lazy.chokidar.watch(patterns_ary, { ignoreInitial: true });
      this.chok.on('all', (event, filepath) => {
        filepath = path.relative(origin, filepath);

        var include = (event === 'unlinkDir') ? [`${filepath}/\*`, filepath] : [ filepath ];
        var sync_opts = { include, ssh: opts.ssh || null };

        log.debug('[sync]', event, 'file', filepath);

        lazy.Sync
          .sync(origin, destination, sync_opts )
          .then(() => this._send(event, 'done', { filepath }))
          .catch((err) => this._send(event, 'fail', _.merge(err, { filepath })));
      })
      .on('ready', () => resolve(true))
      .on('error', (err) => reject(err));
    });
  }

  _check_for_except_from(origin, opts) {
    return async(this, function* () {
      // Find from exceptions in files
      opts = _.clone(opts);
      opts.except = _.flatten([opts.except || []]);

      var exists, file, file_content = '';
      var candidates   = opts.except_from ? [opts.except_from] : [];
      candidates = candidates.concat([
        path.join(origin, ".syncignore"),
        path.join(origin, ".gitignore"),
      ]);

      delete opts.except_from;

      for (var i = 0; i < candidates.length; i++) {
        file   = candidates[i];
        exists = yield fsAsync.exists(file);
        if (exists) {
          opts.except_from = file;
          file_content = yield fsAsync.readFile(file);
          file_content = file_content.toString();
          break;
        }
      }

      opts.except = opts.except.concat(
        _.without(file_content.split('\n'), '')
      );

      return opts;
    });
  }

  _watch_patterns_ary(origin, opts = {}) {
    // TODO Support include
    opts = _.clone(opts);
    opts.include = ['.'];
    opts.except  = _.flatten([opts.except || []]);

    return opts.include.map((pattern) => {
      return path.resolve(origin, pattern);
    }).concat(opts.except.map((pattern) => {
      return '!' + path.resolve(origin, pattern);
    }));
  }

  _send(op, status, opts = {}) {
    this.process.send(JSON.stringify(_.merge({ op, status }, opts)));
  }
}

//
// If this file is a main process, it means that
// this process is being forked by azk itself
//
if (require.main === module) {
  process.title = 'azk sync worker';
  log.debug('[sync]', "sync worker spawned");
  new Worker(process);
}
