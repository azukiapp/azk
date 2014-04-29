#!/usr/bin/env node

var cli = require('azk/cli').cli;

process.once("azk:command:exit", function(code) {
  process.exit(code);
});

cli.cwd = process.env.AZK_CURRENT_SYSTEM || process.cwd();
cli(process.argv);
