require('source-map-support').install();

import { Q, Azk, pp, _, config, t, async } from 'azk';
import { Client as AgentClient } from 'azk/agent/client';
import Utils from 'azk/utils';

var chai  = require('chai');
var tmp   = require('tmp');
var path  = require('path');
var qfs   = require('q-io/fs');
var touch = require('touch');

// Chai extensions
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.config.includeStack = true

import capture_io from 'azk/utils/capture_io'
var MemoryStream  = require('memorystream');

var Helpers = {
  pp: pp,
  capture_io: capture_io,
  expect : chai.expect,

  get docker() {
    return require('azk/docker').default;
  },

  tmp_dir(opts = { prefix: "azk-test-"}) {
    return Q.nfcall(tmp.dir, opts).then((dir) => {
      return Utils.resolve(dir);
    });
  },

  tmpFile(opts = { prefix: "azk-test-"}) {
    return Q.nfcall(tmp.file, opts).spread((file) => {
      return Utils.resolve(file);
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

  fixture_path(...fixture) {
    return Utils.resolve(
      '.', 'spec', 'fixtures', ...fixture
    );
  },

  makeMemoryStream(...args) {
    return new MemoryStream(...args);
  },

  escapeRegExp(...args) {
    return Utils.escapeRegExp(...args);
  },

  describeSkipVm(...args) {
    return config('agent:requires_vm') ? describe(...args) : describe.skip(...args);
  }
}

// In specs the virtual machine is required
before(() => {
  console.log(t('test.before'));
  return AgentClient.require();
});

// Helpers
require('spec/spec_helpers/dustman').extend(Helpers);
require('spec/spec_helpers/mock_outputs').extend(Helpers);
require('spec/spec_helpers/mock_ui').extend(Helpers);
require('spec/spec_helpers/mock_manifest').extend(Helpers);

export default Helpers;
