#!/usr/bin/env node

var require_tree = null;
if (process.env.AZK_PROFILE_REQUIRES) {
  require_tree = require('azk/utils/require_debug');
}

if (process.env.AZK_SUBSCRIBE_POSTAL) {
  var SubscriptionLogger = require("azk/utils/postal").SubscriptionLogger;
  var subscriptionLogger = new SubscriptionLogger();
  subscriptionLogger.subscribeTo(process.env.AZK_SUBSCRIBE_POSTAL);
}

// Load source-map to support transpiled files
var map_opts = {};
if (process.env.AZK_DISABLE_SOURCE_MAP) {
  map_opts = {
    retrieveSourceMap: function() {
      return null;
    }
  };
}

require('source-map-support').install(map_opts);

// Process exit events
process.once("azk:command:exit", function(code) {
  if (require_tree) {
    console.log(require_tree());
  }
  process.stdin.pause();
  process.exit(code);
});

// ps name
var path  = require('path');
var title = path.basename(__filename, ".js");
process.title = [title].concat(process.argv.slice(2)).join(" ");

// Run cli
var cli = require('azk/cli').cli;
cli(process.argv, process.env.AZK_CURRENT_SYSTEM || process.cwd());
