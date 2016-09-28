import { _, lazy_require, path, fsAsync } from 'azk';
import { defer, async, promiseResolve } from 'azk/utils/promises';

// Only for debug
// require('source-map-support').install({});

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

        // Calculate includes, excludes and watch pattern
        let patterns_ary = [], ignored = [];
        let except_from  = yield this._check_for_except_from(origin, stats.isDirectory(), opts.except_from);
        [ patterns_ary, ignored, opts.include, opts.except ] = yield this._process_patterns(origin, except_from, opts);
        delete opts.except_from;

        // Be sure watcher is in proper status
        if (this.status !== WATCH_INIT) { return; }

        yield lazy.Sync.sync(origin, destination, opts);
        this._send('sync', 'done');

        // Be sure watcher is in proper status
        if (this.status !== WATCH_INIT) { return; }
        yield this._start_watcher(patterns_ary, ignored, origin, destination, opts);
        this._send('watch', 'ready');
        this.status = WATCH_READY;
      } catch (err) {
        this.unwatch();
        this._send('sync', 'fail', err);
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

  _start_watcher(patterns_ary, ignored, src, dest, opts = {}) {
    let promise = defer((resolve, reject) => {
      this.chok = lazy.chokidar.watch(patterns_ary, { ignored: ignored, ignoreInitial: true })
        .on('all', (event, filepath) => {
          this._sync(event, filepath, src, dest, opts);
        })
        .on('ready', () => {
          this.chok.removeAllListeners('error');
          resolve(true);
        })
        .on('error', (err) => {
          if (promise.isFulfilled()) {
            err.level = "warning";
            this._send('watch', 'fail', err);
            // restart
            this.watch(src, dest, opts);
          } else {
            err.level = "critical";
            reject(err);
          }
        });
    });
    return promise;
  }

  _sync(event, filepath, src, dest, opts) {
    return async(this, function* () {
      if (event === "unlink" || event === "unlinkDir") {
        var exists = yield fsAsync.exists(filepath);
        if (!exists) {
          filepath = path.join(filepath, '..');
          return this._sync(event, filepath, src, dest, opts);
        }
      }

      let destination = path.join(dest, path.relative(src, filepath));
      let [ include, except ] = this._include_and_except(filepath, src, dest, opts);
      let sync_opts = {
        ssh: opts.ssh || null,
        relative_sufix: opts.relative_sufix,
        include, except,
      };

      return lazy.Sync
        .sync(filepath, destination, sync_opts)
        .then((result) => this._send(event, 'done', _.merge(result, { filepath })))
        .catch((err) => {
          err = _.assign(err, { filepath, level: "warning" });
          this._send(event, 'fail', err);
        });
    });
  }

  _include_and_except(origin, src, dest, opts) {
    let include = opts.include;
    let except  = opts.except;

    if (origin !== src) {
      let relative  = path.relative(src, origin);
      let regex     = new RegExp(`^\/${relative}\/`);
      let reduce_fn = (acc, file) => {
        if ((file.match(/^\//) || file.match(/^\.\//)) && regex.test(file)) {
          acc.push(file.replace(regex, '/'));
        } else if (!(file.match(/^\//) || file.match(/^\.\//))) {
          acc.push(file);
        }
        return acc;
      };
      include = _.reduce(include, reduce_fn, []);
      except  = _.reduce(except, reduce_fn, []);
    }

    return [include, except];
  }

  _check_for_except_from(origin, is_dir, except_from) {
    return async(this, function* () {
      if (!is_dir) { return null; }

      let candidates = except_from ? [except_from] : [];
      candidates = candidates.concat([
        path.join(origin, ".syncignore"),
        path.join(origin, ".gitignore"),
      ]);

      let exists;
      for (let i = 0; i < candidates.length; i++) {
        exists = yield fsAsync.exists(candidates[i]);
        if (exists) { return candidates[i]; }
      }

      return null;
    });
  }

  _process_patterns(origin, except_from, opts = {}) {
    return this
      ._exclude_candidates(opts.except || [], except_from)
      .then((candidates) => {
        let include = [...(opts.include || [])];
        let watch   = _.map([".", ...include], (i) => path.resolve(origin, i));
        let unwatch = [];

        let exclude = _.reduce(candidates, (acc, pattern) => {
          if (pattern.match(/^!/)) {
            pattern = pattern.replace(/^!(.*)/, '$1');
            include.push(pattern);
            watch.push(path.join(origin, pattern));
          } else if (pattern.match(/^\//) || pattern.match(/^\.\//) || pattern.match(/\*\*/)) {
            acc.push(pattern);
            unwatch.push(path.join(origin, pattern));
          } else {
            acc.push(pattern);
            unwatch.push(path.join(origin, '**', pattern));
          }
          return acc;
        }, []);

        return [watch, unwatch, include, exclude];
      });
  }

  _exclude_candidates(except, except_from) {
    if (!_.isEmpty(except_from)) {
      return fsAsync.readFile(except_from).then((content) => {
        content = content.toString().split('\n');
        return except.concat(_.filter(content, (pattern) => {
          return !_.isEmpty(pattern) && !pattern.match(/^\s*#/);
        }));
      });
    }
    return promiseResolve(except);
  }

  _send(op, status, opts = {}) {
    if (opts instanceof Error) {
      opts = JSON.stringify(opts, ["message", "arguments", "type", "name"].concat(Object.keys(opts)));
      opts = JSON.parse(opts);
    }
    this.process.send(JSON.stringify(_.merge({ op, status }, opts)));
  }
}

// If this file is a main process, it means that
// this process is being forked by azk itself
if (require.main === module) {
  process.title = 'azk sync worker';
  new Worker(process);
}
