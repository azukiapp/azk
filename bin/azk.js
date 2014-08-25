#!/usr/bin/env node

require('source-map-support').install();
var cli = require('azk/cli').cli;

process.once("azk:command:exit", function(code) {
  process.exit(code);
});

// ps name
var path = require('path');
title = path.basename(__filename, ".js");
process.title = [title].concat(process.argv.slice(2)).join(" ");

// Run cli
cli(process.argv, process.env.AZK_CURRENT_SYSTEM || process.cwd());
