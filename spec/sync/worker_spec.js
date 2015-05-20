import h from 'spec/spec_helper';
import { _, path, lazy_require } from 'azk';
import { Q, defer, async } from 'azk';

var lazy = lazy_require({
  Worker: ['azk/sync/worker_worker'],
  DirDiff      : ['node-dir-diff', 'Dir_Diff'],
  EventEmitter : ['events'],
  qfs          : 'q-io/fs'
});

describe("Azk sync, Worker module", function() {
  var example_fixtures = h.fixture_path('sync/test_1/');
  var invalid_fixtures = path.join(h.fixture_path('sync/test_1/'), 'invalid');

  function make_copy() {
    return Q.all([
      h.copyToTmp(example_fixtures),
      h.tmp_dir()
    ]);
  }

  function diff(origin, dest) {
    var dd = new lazy.DirDiff([origin, dest], 'full');
    return Q.ninvoke(dd, "compare");
  }

  function create_worker() {
    class FakeProcess extends lazy.EventEmitter {
      send(...args) {
        return this.emit('sending', ...args);
      }
    }
    var bus = new FakeProcess();
    return [bus, new lazy.Worker(bus)];
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

  describe("with a watch to sync a two folders", function() {
    var origin, dest, bus, worker;
    beforeEach(() => {
      return async(function* () {
        [origin, dest] = yield make_copy();
        [bus, worker] = create_worker();

        var msg = yield run_and_wait_msg(bus, () => {
          return bus.emit("message", { origin, destination: dest });
        });

        h.expect(msg).to.have.property('op', 'sync');
        h.expect(msg).to.have.property('status', 'done');
      });
    });

    afterEach(() => worker.unwatch());

    it("should have done initial sync", function() {
      var result = diff(origin, dest);
      return h.expect(result).to.eventually.have.property('deviation', 0);
    });

    it("should sync a added file", function() {
      return async(function* () {
        var file = "bar/foo.bar.txt";
        var origin_file = path.join(origin, file);

        var msg = yield run_and_wait_msg(bus, () => {
          return lazy.qfs.write(origin_file, "foobar");
        });

        h.expect(msg).to.have.property('op', 'add');
        h.expect(msg).to.have.property('filepath', file);
        h.expect(msg).to.have.property('status', 'done');

        var result = yield diff(origin, dest);
        return h.expect(result).to.have.property('deviation', 0);
      });
    });

    it("should sync a changed file", function() {
      return async(function* () {
        var file = "foo/Moe.txt";
        var origin_file = path.join(origin, file);
        var dest_file   = path.join(origin, file);

        var msg = yield run_and_wait_msg(bus, () => {
          return lazy.qfs.write(origin_file, "foobar");
        });

        h.expect(msg).to.have.property('op', 'change');
        h.expect(msg).to.have.property('filepath', file);
        h.expect(msg).to.have.property('status', 'done');

        var content = yield lazy.qfs.read(dest_file);
        h.expect(content).to.equal("foobar");
      });
    });

    it("should sync a removed file", function() {
      return async(function* () {
        var file = "foo/Moe.txt";
        var origin_file = path.join(origin, file);
        var dest_file   = path.join(origin, file);

        var msg = yield run_and_wait_msg(bus, () => {
          return lazy.qfs.remove(origin_file);
        });
        h.expect(msg).to.have.property('op', 'unlink');
        h.expect(msg).to.have.property('filepath', file);
        h.expect(msg).to.have.property('status', 'done');

        var exists = yield lazy.qfs.exists(dest_file);
        h.expect(exists).to.fail;
      });
    });

    it("should sync a removed folder", function() {
      return async(function* () {
        var folder = "foo";
        var origin_folder = path.join(origin, folder);
        var dest_folder   = path.join(origin, folder);

        // Save all msgs
        var wait_msgs = defer((resolve) => {
          var msgs = [];
          bus.on('sending', (msg) => {
            msgs.push(JSON.parse(msg));
            if (msgs.length >= 3) { resolve(msgs); }
          });
        });

        var msg = yield run_and_wait_msg(bus, 'unlinkDir', () => {
          return lazy.qfs.removeTree(origin_folder);
        });
        h.expect(msg).to.have.property('op', 'unlinkDir');
        h.expect(msg).to.have.property('filepath', folder);
        h.expect(msg).to.have.property('status', 'done');

        // Check unlink partials
        var msgs = yield wait_msgs;
        h.expect(msgs).to.include.something.that.deep.eql(
          {"op": "unlink", "status":"done", "filepath":"foo/Barney.txt"}
        );
        h.expect(msgs).to.include.something.that.deep.eql(
          {"op": "unlink", "status":"done", "filepath":"foo/Moe.txt"}
        );

        var exists = yield lazy.qfs.exists(dest_folder);
        h.expect(exists).to.fail;
      });
    });
  });

  it("should forward sync options", function() {
    return async(function* () {
      var [origin, dest]  = yield make_copy();
      var bus  = create_worker()[0];
      var opts = { except: ["foo/"] };

      var msg = yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest, opts });
      });

      h.expect(msg).to.have.property('op', 'sync');
      h.expect(msg).to.have.property('status', 'done');

      var exists = yield lazy.qfs.exists(path.join(dest, "foo"));
      h.expect(exists).to.fail;

      exists = yield lazy.qfs.exists(path.join(dest, "bar"));
      h.expect(exists).to.ok;
    });
  });

  it("should not override a worker", function() {
    return async(function* () {
      var [origin, dest]  = yield make_copy();
      var bus  = create_worker()[0];
      var opts = { except: ["foo/"] };

      var msg = yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest, opts });
      });

      h.expect(msg).to.have.property('op', 'sync');
      h.expect(msg).to.have.property('status', 'done');

      var wait_msgs = defer((resolve) => {
        var msgs = [];
        bus.on('sending', (msg) => {
          msgs.push(JSON.parse(msg));
          if (msgs.length >= 2) { resolve(msgs); }
        });
      });

      yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest, opts });
      });

      var msgs = yield wait_msgs;
      h.expect(msgs).to.include.something.that.deep.eql(
        {"op": "sync", "status":"close"}
      );
      h.expect(msgs).to.include.something.that.deep.eql(
        {"op": "sync", "status":"done"}
      );
    });
  });

  it("should return a error if initial sync fails", function() {
    return async(function* () {
      var origin = yield h.tmp_dir();
      var dest   = path.join(yield h.tmp_dir(), "foo", "bar");
      var bus    = create_worker()[0];

      var msg = yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest });
      });

      h.expect(msg).to.have.property('op', 'sync');
      h.expect(msg).to.have.property('status', 'fail');
      h.expect(msg).to.have.deep.property('err.code', 12);
      h.expect(msg).to.have.deep.property('err.err').and.match(/Error: rsync.*12/);
    });
  });

  it("should return a error if origin not exists", function() {
    return async(function* () {
      var origin = invalid_fixtures;
      var dest   = yield h.tmp_dir();
      var bus    = create_worker()[0];

      var msg = yield run_and_wait_msg(bus, () => {
        return bus.emit("message", { origin, destination: dest });
      });

      h.expect(msg).to.have.property('op', 'sync');
      h.expect(msg).to.have.property('status', 'fail');
      h.expect(msg).to.have.deep.property('err.code', 101);
      h.expect(msg).to.have.deep.property('err.err').and.match(/Sync: origin path not exist/);
    });
  });
});
