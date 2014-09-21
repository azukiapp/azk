require('source-map-support').install();

import { Q, Azk, pp, _, config, t, async } from 'azk';
import Utils from 'azk/utils';
import { set as configSet } from 'azk/config';
//import { VM } from 'azk/agent/vm';
import { Client } from 'azk/agent/client';
import { AgentNotRunning } from 'azk/utils/errors';

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

  return Client.status().then((status) => {
    if (!status.agent) {
      throw new AgentNotRunning();
    }
  });
});

// Helpers
require('spec/spec_helpers/dustman').extend(Helpers);
require('spec/spec_helpers/mock_outputs').extend(Helpers);
require('spec/spec_helpers/mock_ui').extend(Helpers);
require('spec/spec_helpers/mock_manifest').extend(Helpers);

export default Helpers;
