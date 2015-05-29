import h from 'spec/spec_helper';
import { _, path, lazy_require } from 'azk';
import { Q, defer, async } from 'azk';
import { subscribe } from 'azk/utils/postal';

var lazy = lazy_require({
  Watcher: ['azk/sync/watcher'],
  Sync   : ['azk/sync'],
  qfs    : 'q-io/fs',
  semver : 'semver'
});

describe("Azk sync, Watcher module", function() {
  var watcher, subscription;
  var example_fixtures = h.fixture_path('sync/test_1/');

  function make_copy() {
    return Q.all([
      h.copyToTmp(example_fixtures),
      h.tmp_dir()
    ]);
  }

  before(() => {
    watcher = new lazy.Watcher();
  });

  afterEach(() => {
    if (!_.isEmpty(subscription)) {
      subscription.unsubscribe();
      subscription = null;
    }
    watcher.close();
    h.expect(_.keys(watcher.workers)).to.length(0);
  });

  it("should sync two folders", function() {
    return async(function* () {
      var sync_data;
      subscription = subscribe('sync.watcher.sync', (data) => {
        sync_data = data;
      });

      var [origin, dest] = yield make_copy();
      yield watcher.watch(origin, dest);
      h.expect(_.keys(watcher.workers)).to.length(1);

      h.expect(sync_data).to.have.property('op', 'sync');
      h.expect(sync_data).to.have.property('status', 'done');

      var result = yield h.diff(origin, dest);
      h.expect(result).to.have.property('deviation', 0);
    });
  });

  describe("with called to watch a two folders", function() {
    var origin, dest;

    beforeEach(() => {
      return async(function* () {
        [origin, dest] = yield make_copy();

        yield watcher.watch(origin, dest);
        h.expect(_.keys(watcher.workers)).to.length(1);

        var result = yield h.diff(origin, dest);
        h.expect(result).to.have.property('deviation', 0);
      });
    });

    it("should sync two folders and watch", function() {
      return async(function* () {
        var file = "foo/Moe.txt";
        var origin_file = path.join(origin, file);
        var dest_file   = path.join(origin, file);

        var wait_data = defer((resolve) => {
          subscription = subscribe('sync.watcher.*', (data) => {
            resolve(data);
          });
        });

        yield lazy.qfs.write(origin_file, "foobar");

        var data = yield wait_data;
        h.expect(data).to.have.property('op', 'change');
        h.expect(data).to.have.property('filepath', file);
        h.expect(data).to.have.property('status', 'done');

        var content = yield lazy.qfs.read(dest_file);
        h.expect(content).to.equal("foobar");
      });
    });

    it("should reuse a watcher", function() {
      return async(function* () {
        var data = yield defer((resolve) => {
          subscription = subscribe('sync.watcher.init', (data) => {
            resolve(data);
          });
          watcher.watch(origin, dest);
        });

        h.expect(data).to.have.property('status', 'exists');
      });
    });

    it("should remove a watcher", function() {
      return async(function* () {
        h.expect(_.keys(watcher.workers)).to.length(1);

        var data = yield defer((resolve) => {
          subscription = subscribe('sync.watcher.finish', (data) => {
            resolve(data);
          });
          watcher.unwatch(origin, dest);
        });

        h.expect(_.keys(watcher.workers)).to.length(0);
        h.expect(data).to.have.property('status', 'done');
      });
    });

    it("should respawn sync process if worker killed", function() {
      return async(function* () {
        var data_respawn = yield defer((resolve) => {
          var msgs = [];
          subscription = subscribe('sync.watcher.*', (data) => {
            msgs.push(data);
            if (msgs.length >= 3) {
              subscription.unsubscribe();
              resolve(msgs);
            }
          });
          process.kill(watcher.get_worker(origin, dest).child.childData.pid);
        });

        h.expect(data_respawn).to.include.something.that.deep.eql(
          {"op": "restart", "status": "init"}
        );
        h.expect(data_respawn).to.include.something.that.deep.eql(
          {"op": "sync", "status": "done"}
        );
        h.expect(data_respawn).to.include.something.that.deep.eql(
          {"op": "watch", "status": "ready"}
        );

        var file = "foo/Moe.txt";
        var origin_file = path.join(origin, file);
        var dest_file   = path.join(origin, file);
        var wait_change = defer((resolve) => {
          subscription  = subscribe('sync.watcher.*', (data) => {
            resolve(data);
          });
        });

        yield lazy.qfs.write(origin_file, "foobar");

        var data_change = yield wait_change;
        h.expect(data_change).to.have.property('op', 'change');
        h.expect(data_change).to.have.property('filepath', file);
        h.expect(data_change).to.have.property('status', 'done');

        var content = yield lazy.qfs.read(dest_file);
        h.expect(content).to.equal("foobar");
      });
    });
  });

  it("should return a error if initial sync fails", function() {
    return async(function* () {
      var origin = yield h.tmp_dir();
      var dest   = path.join(yield h.tmp_dir(), "foo", "bar");

      var msgs = [];
      subscription = subscribe('sync.watcher.*', (data) => {
        data = _.clone(data);
        delete(data.err);
        msgs.push(data);
      });

      var rsync_version = yield lazy.Sync.version();
      var promise = watcher.watch(origin, dest);

      if (lazy.semver.cmp(rsync_version, '>=', '3.1.0')) {
        yield h.expect(promise).to.be.rejected.and.eventually.have.property('code', 3);
      } else {
        yield h.expect(promise).to.be.rejected.and.eventually.have.property('code', 12);
      }

      h.expect(_.keys(watcher.workers)).to.length(0);

      h.expect(msgs).to.include.something.that.deep.eql({ "op": "sync", "status": "fail" });
      h.expect(msgs).to.include.something.that.deep.eql({ "op": "finish", "status": "done" });
    });
  });
});
