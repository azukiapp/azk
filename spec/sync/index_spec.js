import h from 'spec/spec_helper';
import { Q, async, config, path, lazy_require } from 'azk';

var lazy = lazy_require({
  Sync    : ['azk/sync'],
  DirDiff : ['node-dir-diff', 'Dir_Diff'],
  VM      : ['azk/agent/vm'],
  Client  : ['azk/agent/client'],
  uuid    : 'node-uuid'
});

describe("Azk sync module", function() {
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

  it("should sync two folders", function() {
    return async(function* () {
      var [origin, dest] = yield make_copy();
      var code   = yield lazy.Sync.sync(origin, dest);
      var result = yield diff(origin, dest);
      h.expect(code).to.eql(0);
      h.expect(result).to.have.property('deviation', 0);
    });
  });

  it("should sync one file between two folders", function() {
    return async(function* () {
      var include = "bar/clothes/barney.txt";
      var [origin, dest] = yield make_copy();
      var code   = yield lazy.Sync.sync(origin, dest, { include });

      // Compare folders and files
      var result_folder = yield diff(origin, dest);
      var result_file   = yield diff(path.join(origin, include), path.join(dest, include));

      h.expect(code).to.eql(0);
      h.expect(result_file).to.have.property('deviation', 0);
      h.expect(result_folder).to.have.property('deviation', 8);
    });
  });

  it("should sync two folders but exclude a file list", function() {
    return async(function* () {
      var except = "foo/";
      var [origin, dest] = yield make_copy();
      var code   = yield lazy.Sync.sync(origin, dest, { except });

      // Compare folders and subfolders
      var result_folder    = yield diff(origin, dest);
      var result_subfolder = yield diff(path.join(origin, "bar"), path.join(dest, "bar"));

      h.expect(code).to.eql(0);
      h.expect(result_folder).to.have.property('deviation', 3);
      h.expect(result_subfolder).to.have.property('deviation', 0);
    });
  });

  it("should sync two folders but exclude paths from text file", function() {
    return async(function* () {
      var except_from = h.fixture_path("sync/rsyncignore.txt");
      var [origin, dest] = yield make_copy();
      var code   = yield lazy.Sync.sync(origin, dest, { except_from });

      // Compare folders and subfolders
      var result_folder    = yield diff(origin, dest);
      var result_subfolder = yield diff(path.join(origin, "foo"), path.join(dest, "foo"));

      h.expect(code).to.eql(0);
      h.expect(result_folder).to.have.property('deviation', 7);
      h.expect(result_subfolder).to.have.property('deviation', 0);
    });
  });

  it("should not sync an invalid folder", function() {
    return async(function* () {
      var origin = invalid_fixtures;
      var dest   = yield h.tmp_dir();

      var err_data;
      yield lazy.Sync.sync(origin, dest)
        .then(() => { h.expect(0).to.equal(1); })
        .fail(function(err) { err_data = err; });
      h.expect(err_data).to.have.property('code', 23);
    });
  });

  h.describeRequireVm("with enabled vm", function() {
    it("should sync two folders", function() {
      return async(function* () {
        var name = config("agent:vm:name");
        var dest = path.join("/tmp", lazy.uuid.v4());
        var opts = { ssh: lazy.Client.ssh_opts() };

        // Make destination folder
        var vm_code = yield lazy.VM.ssh(name, "mkdir -p " + dest);
        h.expect(vm_code).to.equal(0);

        // Sync folders
        var code = yield lazy.Sync.sync(example_fixtures, dest, opts);
        h.expect(code).to.eql(0);

        // Test destination folder in vm
        var file    = path.join(dest, "bar/Fred.txt");
        var folder  = path.join(dest, "bar/clothes");
        var cmd     = "test -f " + file + " && test -d " + folder;
        vm_code = yield lazy.VM.ssh(name, cmd);
        h.expect(vm_code).to.equal(0);
      });
    });
  });
});
