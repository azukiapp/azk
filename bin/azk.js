#!/usr/bin/env node

// Load source-map to support transpiled files
require('source-map-support').install();

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
