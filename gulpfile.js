// gulpfile.js
var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  src  : { src: "./src", dest: "./lib/azk" },
  lint: [ "bin/**/*.js" ],
});

// var gulp = azk_gulp.gulp;

// gulp.task("show:args", "Help text", ["before:show"], function() {
//   console.log(azk_gulp.yargs.argv);
//   return null;
// }, { aliases: ["sa", "s"] });
