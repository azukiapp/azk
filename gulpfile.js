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

gulp.task("vm-download", "Download vm files: iso and data disk exemple", function() {
  var url     = 'https://s3-sa-east-1.amazonaws.com/azk/debian2docker/';
  var files   = ['azk.iso', 'azk-agent.vmdk.gz'];
  var download = require("gulp-download");
  for (var i = 0; i < files.length; i++) {
    download(url + files[i])
      .pipe(gulp.dest('./lib/vm'));
  }
});

// gulp.task("show:args", "Help text", ["before:show"], function() {
//   console.log(azk_gulp.yargs.argv);
//   return null;
// }, { aliases: ["sa", "s"] });
