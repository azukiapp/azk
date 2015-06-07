#!/usr/bin/env node

// usefull to profile requires
if (process.env.AZK_ENABLE_CHROME_CPU_PROFILER) {
  var profiler = require('chrome-cpu-profiler');
  profiler.startDate = new Date();
  profiler.startProfiling('cpu-azk-profile');
}

// usefull to see execution timeline
if (process.env.AZK_ENABLE_NJS_TRACE_PROFILER) {
  var path = require('path');
  var rel = path.relative(process.cwd(), __dirname);
  var source_files = path.join(rel, '..', 'lib', '**', '*.js');
  // var no_node_modules = '!' + path.join(rel, '..', '**', 'node_modules', '**');

  global.njstrace = null;
  delete global.njstrace;

  global.njstrace = require('njstrace').inject({
    files: [source_files/*, no_node_modules*/]
  });
}

if (process.env.AZK_PROFILE_REQUIRES) {
  require('azk/utils/require_debug');
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
