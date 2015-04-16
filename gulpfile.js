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

var integration_src = [
  'src/**/*.js',
  'spec/**/*.js',
  'spec/integration/**/*.bats',
  'spec/integration/**/*.bash',
];

gulp.task('lint:babel', "Run lint and babel after this", ['lint', 'babel']);

gulp.task('test:integration', "Run integration tests", ['lint:babel'], function() {
  var filter = 'find spec/integration -name \'*.bats\'';
  if (azk_gulp.yargs.argv.grep) {
    filter = 'grep -Rl "' + azk_gulp.yargs.argv.grep + '" spec/integration';
  }

  var command = lib + '/bats/bin/bats `' + filter + '`';
  var stream  = azk_gulp.shell(command);

  azk_gulp.gutil.log("running: " + azk_gulp.chalk.green(command));
  stream.write(new azk_gulp.gutil.File());
  stream.end();

  return stream;
});

azk_gulp.new_watch('watch:test:integration', integration_src, {}, ['test:integration']);
