import { _, lazy_require, path, fsAsync } from 'azk';
import { defer, async } from 'azk/utils/promises';

var lazy = lazy_require({
  Sync    : ['azk/sync'],
  chokidar: 'chokidar'
});

const WATCH_IDLE = 0, WATCH_INIT = 1, WATCH_READY = 2;

export class Worker {
  constructor(process) {
    this.chok    = null;
    this.status  = WATCH_IDLE;
    this.process = process;
    this.process.on('message', (data) => {
      process.title = "azk sync worker " + data.origin + " " + data.destination;
      this.watch(data.origin, data.destination, data.opts).then(() => {}, () => {});
    });
  }

  watch(origin, destination, opts = {}) {
    this.unwatch();
    this.status = WATCH_INIT;

    return async(this, function* () {
      try {
        // Be sure watcher is in proper status
        if (this.status !== WATCH_INIT) { return; }

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

        // Be sure watcher is in proper status
        if (this.status !== WATCH_INIT) { return; }

        yield lazy.Sync.sync(origin, destination, opts);
        this._send('sync', 'done');

        // Be sure watcher is in proper status
        if (this.status !== WATCH_INIT) { return; }
        var patterns_ary = yield this._watch_patterns_ary(origin, opts);

        // Be sure watcher is in proper status
        if (this.status !== WATCH_INIT) { return; }
        yield this._start_watcher(patterns_ary, origin, destination, opts);
        this._send('watch', 'ready');
        this.status = WATCH_READY;
      } catch (err) {
        this.unwatch();
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
    this.status = WATCH_IDLE;
  }

  _start_watcher(patterns_ary, origin, destination, opts = {}) {
    return defer((resolve, reject) => {
      this.chok = lazy.chokidar.watch(patterns_ary, { ignoreInitial: true });
      this.chok.on('all', (event, filepath) => {
        filepath = path.relative(origin, filepath);

        var include = (event === 'unlinkDir') ? [`${filepath}/\*`, filepath] : [ filepath ];
        var sync_opts = { include, ssh: opts.ssh || null };

        lazy.Sync
          .sync(origin, destination, sync_opts)
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

      var exists, file;
      var candidates = opts.except_from ? [opts.except_from] : [];
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
          break;
        }
      }

      return opts;
    });
  }

  _watch_patterns_ary(origin, opts = {}) {
    return async(this, function* () {
      // TODO Support include
      opts = _.clone(opts);
      opts.include = ['.'];
      opts.except  = _.flatten([opts.except || []]);

      var except_from_content = [];

      if (opts.except_from) {
        except_from_content = yield fsAsync.readFile(opts.except_from);
        except_from_content = except_from_content.toString().split('\n');
      }

      var except_from_ary = _.filter(except_from_content, (pattern) => {
        return !_.isEmpty(pattern) && !pattern.match(/^\s*#/);
      }).map((pattern) => {
        return '!' + path.resolve(origin, pattern);
      }, []);

      return opts.include.map((pattern) => {
        return path.resolve(origin, pattern);
      }, []).concat(opts.except.map((pattern) => {
        return '!' + path.resolve(origin, pattern);
      }, [])).concat(except_from_ary);
    });
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
  new Worker(process);
}
