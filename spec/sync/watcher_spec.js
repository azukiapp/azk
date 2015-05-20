// import h from 'spec/spec_helper';
// import { _, async, config, path, lazy_require } from 'azk';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  Watcher: ['azk/sync/watcher'],
});

describe("Azk sync, Watcher module", function() {
  var watcher;

  before(() => {
    watcher = new lazy.Watcher();
  });

  it("should sync two folders");
  it("should sync two folders and watch");
  it("should reuse a watcher");
  it("should remove a watcher");
  it("should return a error if initial sync fails");
  it("should retry sync if have a initial sync fail");
});
