import h from 'spec/spec_helper';
import { _, config, path, lazy_require } from 'azk';
import { async, all } from 'azk/utils/promises';
import { mkdirp } from 'file-async';

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
      var [origin, dest] = yield make_copy();
      var file = "bar/clothes/blue_fir.json";
      origin = path.join(origin, file);
      dest   = path.join(dest, file);
      yield mkdirp(path.join(dest, ".."));
      var result = yield lazy.Sync.sync(origin, dest);

      // Compare folders and files
      var result_file = yield h.diff(origin, dest);

      h.expect(result).to.have.property('code', 0);
      h.expect(result_file).to.have.property('deviation', 0);
    });
  });

  it("should sync two folders but exclude a file list", function() {
    return async(function* () {
      var except         = "/foo/";
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
      return h.expect(promise).to.be.rejected.and.eventually.have.property('code', 'ENOENT');
    });
  });

  h.describeRequireVm("with enabled vm", function() {
    let vm_name, options;
    let fixture = 'test-app/special:\'` "\\';
    let example_fixtures = h.fixture_path(fixture);

    before(() => {
      vm_name = config('agent:vm:name');
      options = { ssh: lazy.Client.ssh_opts(), except: ['test file 2'] };
    });

    it("should sync relative path", function* () {
      let dest = path.join('/tmp', lazy.uuid.v4());
      let relative_sufix = path.join(example_fixtures, '..', '..');
      let opts = _.merge({}, options, { relative_sufix });

      // Sync folders
      var result = yield lazy.Sync.sync(example_fixtures, dest, opts);
      h.expect(result).to.have.property('code', 0);

      // Test destination folder in vm
      dest = path.join(dest, fixture).replace(/([`"\\])/g, '\\$1');
      let file    = path.join(dest, 'test file 1');
      let folder  = path.join(dest, 'test file 2');
      let cmd     = `test -f "${file}" && test ! -f "${folder}"`;
      let vm_code = yield lazy.VM.ssh(vm_name, cmd);

      h.expect(vm_code).to.equal(0, 'files no synced to destination');
    });

    it("should sync two folders", function* () {
      var dest = path.join('/tmp', lazy.uuid.v4(), "a b'`\\\"");

      // Make destination folder
      var vm_code = yield lazy.VM.ssh(vm_name, "mkdir -p " + path.join(dest, ".."));
      h.expect(vm_code).to.equal(0);

      // Sync folders
      var result = yield lazy.Sync.sync(example_fixtures, dest, options);
      h.expect(result).to.have.property('code', 0);

      // Test destination folder in vm
      dest = dest.replace(/([`"\\])/g, '\\$1');
      var file   = path.join(dest, 'test file 1');
      var folder = path.join(dest, 'test file 2');
      var cmd    = `test -f "${file}" && test ! -f "${folder}"`;
      vm_code = yield lazy.VM.ssh(vm_name, cmd);

      h.expect(vm_code).to.equal(0, 'files no synced to destination');
    });
  });
});
