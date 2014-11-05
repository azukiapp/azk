#!/usr/bin/env node

var root    = process.env.AZK_ROOT_PATH;
var fs      = require('fs');
var version = require(root + '/package.json').version;

require('source-map-support').install({
  retrieveSourceMap: function(source) {
    var map_file = source + '.map';
    if (fs.existsSync(map_file)) {
      var map = JSON.parse(fs.readFileSync(map_file, 'utf8'));
      map.sourceRoot = '/azk.io:' + version;
      return {
        url: source,
        map: map,
      };
    }
    return null;
  }
});
var cli = require('azk/cli').cli;

process.once("azk:command:exit", function(code) {
  process.stdin.pause();
  process.exit(code);
});

// ps name
var path = require('path');
title = path.basename(__filename, ".js");
process.title = [title].concat(process.argv.slice(2)).join(" ");

// Run cli
cli(process.argv, process.env.AZK_CURRENT_SYSTEM || process.cwd());
