require('source-map-support').install();

import { Q, pp, config, t, _ } from 'azk';
import { Client as AgentClient } from 'azk/agent/client';
import Utils from 'azk/utils';

var tmp   = require('tmp');
var qfs   = require('q-io/fs');
var touch = require('touch');

// Chai extensions
var chai = require('azk-dev/chai');

import capture_io from 'azk/utils/capture_io';
var MemoryStream  = require('memorystream');

var Helpers = {
  pp: pp,
  capture_io: capture_io,
  expect : chai.expect,

  get no_required_agent() {
    return (_.contains(process.argv, '--no-required-agent') || process.env.AZK_NO_REQUIRED_AGENT);
  },

  get docker() {
    if (!Helpers.no_required_agent) {
      return require('azk/docker').default;
    }
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

  describeRequireVm(...args) {
    return config('agent:requires_vm') ? describe(...args) : describe.skip(...args);
  },

};

// In specs the virtual machine is required
if (!Helpers.no_required_agent) {
  before(() => {
    console.log(t('test.before'));
    return AgentClient.require();
  });
}

after(() => {
  if (process.env.AZK_ENABLE_NJS_TRACE_PROFILER) {
    global.njstrace.save('/home/julio/_git/njstrace/examples/02-es5/execute/TRACE_RESULT.json');
  }
});

// Helpers
require('spec/spec_helpers/dustman').extend(Helpers);
require('spec/spec_helpers/mock_outputs').extend(Helpers);
require('spec/spec_helpers/mock_ui').extend(Helpers);
require('spec/spec_helpers/mock_manifest').extend(Helpers);

export default Helpers;
