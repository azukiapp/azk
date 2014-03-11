#!/usr/bin/env node

var cli = require('../lib/cli');

process.once("azk:command:exit", function(code) {
  process.exit(code);
});

cli.cwd = process.cwd();
cli(process.argv);
