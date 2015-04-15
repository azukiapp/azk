// Lib path
var path = require('path');
var lib  = process.env.AZK_LIB_PATH || 'lib';

var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  src  : { src: "./src" , dest: path.join(lib, "/azk") },
  spec : { src: "./spec", dest: path.join(lib, "/spec") },
  mocha: { timeout: 10000 },
  lint: [ "bin/**/*.js" ],
});

// Load gulp
var gulp = azk_gulp.gulp;

// gulp.task("show:args", "Help text", ["before:show"], function() {
//   console.log(azk_gulp.yargs.argv);
//   return null;
// }, { aliases: ["sa", "s"] });
