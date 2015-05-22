require('source-map-support').install();

import { Q, pp, config, t, _, lazy_require } from 'azk';
import { Client as AgentClient } from 'azk/agent/client';
import Utils from 'azk/utils';

var lazy = lazy_require({
  MemoryStream: 'memorystream',
  dirdiff : 'dirdiff',
  tmp     : 'tmp',
  qfs     : 'q-io/fs',
  touch   : 'touch',
});

var chai = require('azk-dev/chai');
var Helpers = {
  pp: pp,
  expect: chai.expect,
  get capture_io() {
    return require('azk/utils/capture_io').capture_io;
  },

  get no_required_agent() {
    return (_.contains(process.argv, '--no-required-agent') || process.env.AZK_NO_REQUIRED_AGENT);
  },

  get docker() {
    if (!Helpers.no_required_agent) {
      return require('azk/docker').default;
    }
  },

  tmp_dir(opts = { prefix: "azk-test-"}) {
    return Q.nfcall(lazy.tmp.dir, opts).then((dir) => {
      return Utils.resolve(dir);
    });
  },

  tmpFile(opts = { prefix: "azk-test-"}) {
    return Q.nfcall(lazy.tmp.file, opts).spread((file) => {
      return Utils.resolve(file);
    });
  },

  touchSync(path) {
    return lazy.touch.sync(path);
  },

  copyToTmp(origin) {
    return this.tmp_dir({ prefix: 'azk-test-'}).then((dir) => {
      return lazy.qfs.copyTree(origin, dir).then(() => {
        return dir;
      });
    });
  },

  diff(origin, dest) {
    return Q.nfcall(lazy.dirdiff, origin, dest, { fileContents: true })
      .then((diffs) => {
        diffs.deviation = diffs.length;
        return diffs;
      });
  },

  fixture_path(...fixture) {
    return Utils.resolve(
      '.', 'spec', 'fixtures', ...fixture
    );
  },

  makeMemoryStream(...args) {
    return new lazy.MemoryStream(...args);
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
