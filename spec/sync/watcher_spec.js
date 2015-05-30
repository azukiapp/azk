import h from 'spec/spec_helper';
import { _, path, lazy_require } from 'azk';
import { Q } from 'azk';

var lazy = lazy_require({
  Watcher: ['azk/sync/watcher'],
  Sync   : ['azk/sync'],
  qfs    : 'q-io/fs',
  semver : 'semver'
});

describe("Azk sync, Watcher module", function() {
  var watcher;
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
    watcher.close();
    h.expect(_.keys(watcher.workers)).to.length(0);
  });

  it("should sync two folders", function* () {
    var wait_msg = h.wait_msg("sync.watcher.sync");

    var [origin, dest] = yield make_copy();
    yield watcher.watch(origin, dest);
    h.expect(_.keys(watcher.workers)).to.length(1);

    var msg = yield wait_msg;
    h.expect(msg).to.have.property('op', 'sync');
    h.expect(msg).to.have.property('status', 'done');

    var result = yield h.diff(origin, dest);
    h.expect(result).to.have.property('deviation', 0);
  });

  describe("with called to watch a two folders", function() {
    var origin, dest;

    beforeEach(function* () {
      [origin, dest] = yield make_copy();

      yield watcher.watch(origin, dest);
      h.expect(_.keys(watcher.workers)).to.length(1);

      var result = yield h.diff(origin, dest);
      h.expect(result).to.have.property('deviation', 0);
    });

    it("should sync two folders and watch", function* () {
      var file = "foo/Moe.txt";
      var origin_file = path.join(origin, file);
      var dest_file   = path.join(origin, file);

      var wait_msg = h.wait_msg("sync.watcher.*");
      yield lazy.qfs.write(origin_file, "foobar");
      var msg = yield wait_msg;

      h.expect(msg).to.have.deep.property('op', 'change');
      h.expect(msg).to.have.deep.property('filepath', file);
      h.expect(msg).to.have.deep.property('status', 'done');

      var content = yield lazy.qfs.read(dest_file);
      h.expect(content).to.equal("foobar");
    });

    it("should reuse a watcher", function* () {
      var msg = yield h.wait_msg("sync.watcher.init", null, () => {
        watcher.watch(origin, dest);
      });
      h.expect(msg).to.have.property('status', 'exists');
    });

    it("should remove a watcher", function* () {
      h.expect(_.keys(watcher.workers)).to.length(1);
      var msg = yield h.wait_msg("sync.watcher.finish", null, () => {
        watcher.unwatch(origin, dest);
      });

      h.expect(_.keys(watcher.workers)).to.length(0);
      h.expect(msg).to.have.property('status', 'done');
    });

    it("should respawn sync process if worker killed", function* () {
      var filter = (msg, msgs) => { msg; return msgs.length >= 3; };
      var msgs = yield h.wait_msgs("sync.watcher.*", filter, () => {
        process.kill(watcher.get_worker(origin, dest).child.childData.pid);
      });

      h.expect(msgs).to.include.something.that.deep.eql(
        {"op": "restart", "status": "init"}
      );
      h.expect(msgs).to.include.something.that.deep.eql(
        {"op": "sync", "status": "done"}
      );
      h.expect(msgs).to.include.something.that.deep.eql(
        {"op": "watch", "status": "ready"}
      );

      var file = "foo/Moe.txt";
      var origin_file = path.join(origin, file);
      var dest_file   = path.join(origin, file);
      var wait_msgs   = h.wait_msg('sync.watcher.*');

      yield lazy.qfs.write(origin_file, "foobar");

      var msg_change = yield wait_msgs;
      h.expect(msg_change).to.have.property('op', 'change');
      h.expect(msg_change).to.have.property('filepath', file);
      h.expect(msg_change).to.have.property('status', 'done');

      var content = yield lazy.qfs.read(dest_file);
      h.expect(content).to.equal("foobar");
    });
  });

  it("should return a error if initial sync fails", function* () {
    var origin = yield h.tmp_dir();
    var dest   = path.join(yield h.tmp_dir(), "foo", "bar");

    var filter    = (msg) => msg.op == "finish";
    var wait_msgs = h.wait_msgs('sync.watcher.*', filter);

    var rsync_version = yield lazy.Sync.version();
    var promise = watcher.watch(origin, dest);

    if (lazy.semver.cmp(rsync_version, '>=', '3.1.0')) {
      yield h.expect(promise).to.be.rejected.and.eventually.have.property('code', 3);
    } else {
      yield h.expect(promise).to.be.rejected.and.eventually.have.property('code', 12);
    }

    h.expect(_.keys(watcher.workers)).to.length(0);

    var msgs = yield wait_msgs;
    h.expect(msgs).to.containSubset([{ "op": "sync", "status": "fail" }]);
    h.expect(msgs).to.containSubset([{ "op": "finish", "status": "done" }]);
  });
});
