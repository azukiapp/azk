require('source-map-support').install();

import { Q, Azk, pp, _, config, t, async } from 'azk';
import Utils from 'azk/utils';
import { set as configSet } from 'azk/config';
import { VM } from 'azk/agent/vm';

var chai  = require('chai');
var tmp   = require('tmp');
var path  = require('path');
var qfs   = require('q-io/fs');
var touch = require('touch');

// Chai extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));

import capture_io from 'azk/utils/capture_io'
var MemoryStream  = require('memorystream');

var Helpers = {
  pp: pp,
  capture_io: capture_io,
  expect : chai.expect,

  tmp_dir() {
    return Q.nfcall(tmp.dir).then((dir) => {
      return Utils.resolve(dir);
    });
  },

  touchSync(path) {
    return touch.sync(path);
  },

  copyToTmp(origin) {
    return this.tmp_dir({ prefix: 'azk-test-'}).then((dir) => {
      return qfs.copyTree(origin, dir).then(() => {
        return dir;
      });
    });
  },

  fixture_path(fixture) {
    return Utils.resolve(
      '.', 'spec', 'fixtures', fixture
    );
  },

  makeMemoryStream(...args) {
    return new MemoryStream(...args);
  },

  escapeRegExp(value) {
    return (value || "").replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }
}

// In specs the virtual machine is required
before(() => {
  console.log(t('test.before'));
  console.log(`  ${t('test.check_vm')}`);

  var vm_name = config("agent:vm:name");
  return Q.async(function* () {
    var installed = yield VM.isInstalled(vm_name);
    var running   = (installed) ? yield VM.isRunnig(vm_name) : false;

    if (!installed) {
      throw new Error(t("commands.vm.not_installed"));
    } else if (!running) {
      throw new Error(t("commands.vm.not_runnig"));
    }
  })();
});

// Helpers
require('spec/spec_helpers/dustman').extend(Helpers);
require('spec/spec_helpers/mock_outputs').extend(Helpers);
require('spec/spec_helpers/mock_ui').extend(Helpers);
require('spec/spec_helpers/mock_manifest').extend(Helpers);

export default Helpers;
