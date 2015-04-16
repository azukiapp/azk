#!/usr/bin/env node

if (process.env.AZK_PROFILE_REQUIRES) {
  require('azk/utils/require_debug');
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
