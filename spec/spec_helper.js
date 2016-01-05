require('source-map-support').install();

import { pp, config, t, _, fsAsync, lazy_require } from 'azk';
import { nfcall } from 'azk/utils/promises';
import { Client as AgentClient } from 'azk/agent/client';
import Utils from 'azk/utils';

var lazy = lazy_require({
  MemoryStream: 'memorystream',
  dirdiff     : 'dirdiff',
  tmp         : 'tmp'
});

var chai = require('chai');

// Chai extensions
chai.use(require('chai-subset'));
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.config.includeStack = true;

if (process.env.AZK_SUBSCRIBE_POSTAL) {
  var SubscriptionLogger = require("azk/utils/postal").SubscriptionLogger;
  var subscriptionLogger = new SubscriptionLogger();
  subscriptionLogger.subscribeTo(process.env.AZK_SUBSCRIBE_POSTAL);
}

var Helpers = {
  pp: pp,
  expect: chai.expect,

  get no_required_agent() {
    return (_.contains(process.argv, '--no-required-agent') || process.env.AZK_NO_REQUIRED_AGENT);
  },

  get docker() {
    return require('azk/docker').default;
  },

  tmp_dir(opts = { prefix: "azk-test-"}) {
    return nfcall(lazy.tmp.dir, opts).then((dir) => {
      return Utils.resolve(dir);
    });
  },

  tmpFile(opts = { prefix: "azk-test-"}) {
    return nfcall(lazy.tmp.file, opts).spread((file) => {
      return Utils.resolve(file);
    });
  },

  copyToTmp(origin) {
    return this.tmp_dir({ prefix: 'azk-test-'}).then((dir) => {
      return fsAsync.copy(origin, dir).then(() => {
        return dir;
      });
    });
  },

  diff(origin, dest) {
    return nfcall(lazy.dirdiff, origin, dest, { fileContents: true })
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

  fixture_require_path(...fixture) {
    var lib  = process.env.AZK_LIB_PATH || 'lib';
    return Utils.resolve(
      lib, 'spec', 'fixtures', ...fixture
    );
  },

  makeMemoryStream(...args) {
    return new lazy.MemoryStream(...args);
  },

  escapeRegExp(...args) {
    return Utils.escapeRegExp(...args);
  },

  regexFromT(...args) {
    return new RegExp(this.escapeRegExp(t(...args)));
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
  require('azk/utils/postal').unsubscribeAll();
});

// Helpers
require('spec/spec_helpers/mocha_with_async').extend(Helpers);
require('spec/spec_helpers/dustman').extend(Helpers);
require('spec/spec_helpers/mock_outputs').extend(Helpers);
require('spec/spec_helpers/mock_ui').extend(Helpers);
require('spec/spec_helpers/mock_manifest').extend(Helpers);
require('spec/spec_helpers/wait_subscription').extend(Helpers);

export default Helpers;
