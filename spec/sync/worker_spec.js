import h from 'spec/spec_helper';
import { _, path, lazy_require, fsAsync } from 'azk';
import { defer, async, all } from 'azk/utils/promises';

require('source-map-support').install({});

var lazy = lazy_require({
  Sync         : ['azk/sync'],
  Worker       : ['azk/sync/worker'],
  EventEmitter : ['events'],
  semver       : 'semver'
});

describe("Azk sync, Worker module", function() {
  this.timeout(20000);

  var workers = [];
  var example_fixtures = h.fixture_path('sync/test_1/');
  var invalid_fixtures = path.join(h.fixture_path('sync/test_1/'), 'invalid');

  function make_copy() {
    return all([
      h.copyToTmp(example_fixtures),
      h.tmp_dir()
    ]);
  }

  function create_worker() {
    class FakeProcess extends lazy.EventEmitter {
      send(...args) {
        return this.emit('sending', ...args);
      }
    }
    let bus = new FakeProcess();
    let worker = new lazy.Worker(bus);
    workers.push(worker);
    return [bus, worker];
  }

  function run_and_wait_msg(bus, filter, block = null) {
    return async(function* () {
      if (_.isFunction(filter)) {
        [filter, block] = [null, filter];
      }
      var wait = defer((resolve) => {
        bus.on('sending', (msg) => {
          msg = JSON.parse(msg);
          if (_.isEmpty(filter)) {
            return resolve(msg);
          } else if (msg.op === filter) {
            return resolve(msg);
          }
        });
      });

      yield block();

      return wait;
    });
  }

  afterEach(() => {
    _.each(workers, (worker) => worker.unwatch());
  });

  describe("with a watch to sync a two folders", function() {
    var origin, dest, bus;
    beforeEach(function* () {
      [origin, dest] = yield make_copy();
      [bus] = create_worker();

      // No test excludes yet
      yield fsAsync.remove(path.join(origin, ".syncignore"));

      var msg = yield run_and_wait_msg(bus, "watch", () => {
        return bus.emit("message", { origin, destination: dest });
      });

      h.expect(msg).to.have.property('op', 'watch');
      h.expect(msg).to.have.property('status', 'ready');
    });

    it("should have done initial sync", function() {
      var result = h.diff(origin, dest);
      return h.expect(result).to.eventually.have.property('deviation', 0);
    });

    it("should sync a added file", function() {
      return async(function* () {
        var file = "bar/foo.bar.txt";
        var origin_file = path.join(origin, file);

        var msg = yield run_and_wait_msg(bus, () => {
          return fsAsync.writeFile(origin_file, "foobar");
        });

        h.expect(msg).to.have.property('op', 'add');
        h.expect(msg).to.have.property('filepath', origin_file);
        h.expect(msg).to.have.property('status', 'done');

        var result = yield h.diff(origin, dest);
        return h.expect(result).to.have.property('deviation', 0);
      });
    });

    it("should sync a changed file", function() {
      return async(function* () {
        var file = "foo/Moe.txt";
        var origin_file = path.join(origin, file);
        var dest_file   = path.join(origin, file);

        var msg = yield run_and_wait_msg(bus, () => {
          return fsAsync.writeFile(origin_file, "foobar");
        });

        h.expect(msg).to.have.property('op', 'change');
        h.expect(msg).to.have.property('filepath', origin_file);
        h.expect(msg).to.have.property('status', 'done');

        var content = yield fsAsync.readFile(dest_file);
        h.expect(content.toString()).to.equal("foobar");
      });
    });

    it("should sync a removed file, syncing your parent", function() {
      return async(function* () {
        var file = "foo/Moe.txt";
        var origin_file = path.join(origin, file);
        var dest_file   = path.join(origin, file);

        var msg = yield run_and_wait_msg(bus, () => {
          return fsAsync.remove(origin_file);
        });
        h.expect(msg).to.have.property('op', 'unlink');
        h.expect(msg).to.have.property('filepath', path.join(origin_file, '..'));
        h.expect(msg).to.have.property('status', 'done');

        var exists = yield fsAsync.exists(dest_file);
        h.expect(exists).to.fail;
      });
    });

    it("should sync a removed folder", function() {
      return async(function* () {
        var folder = "foo";
        var origin_folder = path.join(origin, folder);
        var dest_folder   = path.join(origin, folder);

        // Save all messages and call check via event emitter
        var wait_msgs = defer((resolve) => {
          var msgs = [];
          var call = (msg) => {
            msgs.push(JSON.parse(msg));
            if (msgs.length >= 3) {
              bus.removeListener('sending', call);
              resolve(msgs);
            }
          };
          bus.on('sending', call);
        });

        var msg = yield run_and_wait_msg(bus, 'unlinkDir', () => {
          return fsAsync.remove(origin_folder);
        });
        h.expect(msg).to.have.property('op', 'unlinkDir');
        h.expect(msg).to.have.property('filepath', origin);
        h.expect(msg).to.have.property('status', 'done');

        // Check unlink partials
        var msgs = yield wait_msgs;
        h.expect(msgs).to.length(3);
        h.expect(msgs).to.containSubset([
          {"op": "unlink", "status":"done", "filepath": origin}
        ]);

        var exists = yield fsAsync.exists(dest_folder);
        h.expect(exists).to.fail;
      });
    });
  });

  it("should forward sync options", function* () {
    var [origin, dest]  = yield make_copy();
    var [bus] = create_worker();
    var opts  = { except: ["foo/"] };

    var msg = yield run_and_wait_msg(bus, 'watch', () => {
      return bus.emit("message", { origin, destination: dest, opts });
    });

    h.expect(msg).to.have.property('op', 'watch');
    h.expect(msg).to.have.property('status', 'ready');

    var exists = yield fsAsync.exists(path.join(dest, "foo"));
    h.expect(exists).to.fail;

    exists = yield fsAsync.exists(path.join(dest, "bar"));
    h.expect(exists).to.ok;
  });

  it("should not include content patterns files from except_from option", function* () {
    var [origin, dest]  = yield make_copy();
    let worker = create_worker()[1];
    yield worker.watch(origin, dest, {
      except_from: h.fixture_path("sync/rsyncignore.txt"),
      except: [ "/ignored" ]
    });

    var wait = defer((resolve) => {
      worker.chok.on('all', (event, filepath) => {
        resolve(filepath);
      });
    });

    yield fsAsync.writeFile(path.join(origin, "ignored/Fred.txt"), "foobar");
    yield fsAsync.writeFile(path.join(origin, "bar/Fred.txt"), "foobar");
    yield fsAsync.writeFile(path.join(origin, "foo/Moe.txt" ), "foobar");

    var msgs = yield wait;
    h.expect(msgs).to.not.match(/ignored\/Fred.txt/);
    h.expect(msgs).to.not.match(/bar\/Fred.txt/);
    h.expect(msgs).to.match(/foo\/Moe.txt/);
  });

  it("should exclude the .gitignore content for default", function* () {
    var [origin, dest]  = yield make_copy();
    yield fsAsync.writeFile(path.join(origin, ".gitignore"), "/ignored");
    yield fsAsync.remove(path.join(origin, ".syncignore"));

    let worker = create_worker()[1];
    yield worker.watch(origin, dest, {});

    var exists = yield fsAsync.exists(path.join(dest, "ignored"));
    h.expect(exists).to.be.not.ok;

    var wait = defer((resolve) => {
      worker.chok.on('all', (event, filepath) => {
        resolve(filepath);
      });
    });

    yield fsAsync.writeFile(path.join(origin, "ignored/Fred.txt"), "foobar");
    yield fsAsync.writeFile(path.join(origin, "foo/Moe.txt" ), "foobar");

    var msgs = yield wait;
    h.expect(msgs).to.not.match(/ignored\/Fred.txt/);
    h.expect(msgs).to.match(/foo\/Moe.txt/);
  });

  it("should exclude the .syncignore content for default in preference to .gitignore", function* () {
    var [origin, dest]  = yield make_copy();

    let worker = create_worker()[1];
    yield worker.watch(origin, dest, {});

    var exists = yield fsAsync.exists(path.join(dest, "ignored"));
    h.expect(exists).to.be.ok;

    exists = yield fsAsync.exists(path.join(dest, "foo"));
    h.expect(exists).to.be.not.ok;

    var wait = defer((resolve) => {
      worker.chok.on('all', (event, filepath) => {
        resolve(filepath);
      });
    });

    yield fsAsync.writeFile(path.join(origin, "ignored/Fred.txt"), "foobar");
    yield fsAsync.writeFile(path.join(origin, "foo/Moe.txt" ), "foobar");

    var msgs = yield wait;
    h.expect(msgs).to.match(/ignored\/Fred.txt/);
    h.expect(msgs).to.not.match(/foo\/Moe.txt/);
  });

  it("should not override a worker", function* () {
    var [origin, dest]  = yield make_copy();
    var [bus] = create_worker();
    var opts  = { except: ["foo/"] };

    var msg = yield run_and_wait_msg(bus, 'watch', () => {
      return bus.emit("message", { origin, destination: dest, opts });
    });

    h.expect(msg).to.have.property('op', 'watch');
    h.expect(msg).to.have.property('status', 'ready');

    // Save all messages and call check via event emitter
    var wait_msgs = defer((resolve) => {
      var msgs = [];
      var call = (msg) => {
        msgs.push(JSON.parse(msg));
        if (msgs.length >= 2) {
          bus.removeListener('sending', call);
          resolve(msgs);
        }
      };
      bus.on('sending', call);
    });

    yield run_and_wait_msg(bus, () => {
      return bus.emit("message", { origin, destination: dest, opts });
    });

    var msgs = yield wait_msgs;
    h.expect(msgs).to.containSubset([
      {"op": "sync" , "status":"done" },
      {"op": "watch", "status":"ready"},
    ]);
  });

  it("should return a error if initial sync fails", function() {
    return async(function* () {
      var origin = yield h.tmp_dir();
      var dest   = path.join(yield h.tmp_dir(), "foo", "bar");
      var [bus]  = create_worker();
      var rsync_version = yield lazy.Sync.version();

      var msg = yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest });
      });

      h.expect(msg).to.have.property('op', 'sync');
      h.expect(msg).to.have.property('status', 'fail');

      if (lazy.semver.cmp(rsync_version, '>=', '3.1.0')) {
        h.expect(msg).to.have.deep.property('code', 3);
        h.expect(msg).to.have.deep.property('message').and.match(/rsync.*3/);
      } else {
        h.expect(msg).to.have.deep.property('code', 12);
        h.expect(msg).to.have.deep.property('message').and.match(/rsync.*12/);
      }
    });
  });

  it("should return a error if origin not exists", function() {
    return async(function* () {
      var origin = invalid_fixtures;
      var dest   = yield h.tmp_dir();
      var [bus]  = create_worker();

      var msg = yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest });
      });

      h.expect(msg).to.have.property('op', 'sync');
      h.expect(msg).to.have.property('status', 'fail');
      h.expect(msg).to.have.deep.property('code', 101);
      h.expect(msg).to.have.deep.property('err').and.match(/Sync: origin path not exist/);
    });
  });
});
