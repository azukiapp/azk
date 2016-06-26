import h from 'spec/spec_helper';
import { config, path, lazy_require } from 'azk';
import { async, all } from 'azk/utils/promises';

var lazy = lazy_require({
  Sync  : ['azk/sync'],
  VM    : ['azk/agent/vm'],
  Client: ['azk/agent/client'],
  uuid  : 'node-uuid'
});

describe("Azk sync, main module", function() {
  var invalid_fixtures = path.join(h.fixture_path('sync/test_1/'), 'invalid');

  function make_copy(fixture_path = 'sync/test_1/') {
    var fixtures = h.fixture_path(fixture_path);
    return all([
      h.copyToTmp(fixtures),
      h.tmp_dir()
    ]);
  }

  it("should get rsync version", function() {
    return async(function* () {
      var version = yield lazy.Sync.version();
      h.expect(version).to.match(/\d+.\d+.\d+/);
    });
  });

  it("should sync two folders", function() {
    return async(function* () {
      var [origin, dest] = yield make_copy();
      var result         = yield lazy.Sync.sync(origin, dest);
      var diff           = yield h.diff(origin, dest);

      h.expect(result).to.have.property('code', 0);
      h.expect(diff).to.have.property('deviation', 0);
    });
  });

  it("should sync one file between two folders", function() {
    return async(function* () {
      var include        = "bar/clothes/barney.txt";
      var [origin, dest] = yield make_copy();
      var result         = yield lazy.Sync.sync(origin, dest, { include });

      // Compare folders and files
      var result_folder = yield h.diff(origin, dest);
      var result_file   = yield h.diff(path.join(origin, include), path.join(dest, include));

      h.expect(result).to.have.property('code', 0);
      h.expect(result_file).to.have.property('deviation', 0);
      h.expect(result_folder).to.have.property('deviation', 10);
    });
  });

  it("should sync two folders but exclude a file list", function() {
    return async(function* () {
      var except         = "foo/";
      var [origin, dest] = yield make_copy();
      var result         = yield lazy.Sync.sync(origin, dest, { except });

      // Compare folders and subfolders
      var result_folder    = yield h.diff(origin, dest);
      var result_subfolder = yield h.diff(path.join(origin, "bar"), path.join(dest, "bar"));

      h.expect(result).to.have.property('code', 0);
      h.expect(result_folder).to.have.property('deviation', 3);
      h.expect(result_subfolder).to.have.property('deviation', 0);
    });
  });

  it("should sync two folders but exclude paths from text file", function() {
    return async(function* () {
      var except_from    = h.fixture_path("sync/rsyncignore.txt");
      var [origin, dest] = yield make_copy();
      var result         = yield lazy.Sync.sync(origin, dest, { except_from });

      // Compare folders and subfolders
      var result_folder    = yield h.diff(origin, dest);
      var result_subfolder = yield h.diff(path.join(origin, "foo"), path.join(dest, "foo"));

      h.expect(result).to.have.property('code', 0);
      h.expect(result_folder).to.have.property('deviation', 7);
      h.expect(result_subfolder).to.have.property('deviation', 0);
    });
  });

  it("should sync two folders containing special character on path", function() {
    return async(function* () {
      var [origin, dest] = yield make_copy('test-app/special:\'` "\\');
      dest = path.join(dest, 'special:\'` "\\');

      var result = yield lazy.Sync.sync(origin, dest);
      var diff   = yield h.diff(origin, dest);

      h.expect(result).to.have.property('code', 0);
      h.expect(diff).to.have.property('deviation', 0);
    });
  });

  it("should not sync an invalid folder", function() {
    return async(function* () {
      var origin = invalid_fixtures;
      var dest   = yield h.tmp_dir();

      var promise = lazy.Sync.sync(origin, dest);
      return h.expect(promise).to.be.rejected.and.eventually.have.property('code', 23);
    });
  });

  h.describeRequireVm("with enabled vm", function() {
    it("should sync two folders", function() {
      return async(function* () {
        var name = config('agent:vm:name');
        var dest = path.join('/tmp', lazy.uuid.v4(), "a b'`\\\"");
        var opts = { ssh: lazy.Client.ssh_opts(), except: ['test file 2'] };
        var example_fixtures = h.fixture_path('test-app/special:\'` "\\');

        // Make destination folder
        var vm_code = yield lazy.VM.ssh(name, "mkdir -p " + path.join(dest, ".."));
        h.expect(vm_code).to.equal(0);

        // Sync folders
        var result = yield lazy.Sync.sync(example_fixtures, dest, opts);
        h.expect(result).to.have.property('code', 0);

        // Test destination folder in vm
        dest = dest.replace(/([`"\\])/g, '\\$1');
        var file   = path.join(dest, 'test file 1');
        var folder = path.join(dest, 'test file 2');
        var cmd    = `test -f "${file}" && test ! -f "${folder}"`;
        vm_code = yield lazy.VM.ssh(name, cmd);

        h.expect(vm_code).to.equal(0, 'files no synced to destination');
      });
    });
  });
});
