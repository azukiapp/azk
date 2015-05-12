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

// Load envs from .env files
var dotenv = require('dotenv');
dotenv.load({ silent: true });

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

// Publish packages
gulp.task('publish', function() {
  var awspublish  = require('gulp-awspublish');
  var parallelize = require("concurrent-transform");
  var rename      = require("gulp-rename");
  var gulpif      = require("gulp-if");
  var path_join   = require('path').join;

  // Select bucket
  var bucket = process.env[
    "AWS_PACKAGE_BUCKET_" + (azk_gulp.yargs.argv.production ? "PROD" : "STAGE")
  ];

  // create a new publisher
  var publisher = awspublish.create({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_KEY,
    bucket: bucket,
    region: 'sa-east-1',
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=31536000, no-transform, public',
  };

  var src = [
    'package/brew/*.tar.gz',
    'package/public/!(fedora20)/**/*',
    'package/fedora20/**/*',
  ]

  var add_prefix = function(cond, prefix) {
    return gulpif(cond, rename(function (path) {
      path.dirname = path_join(prefix, path.dirname);
    }));
  };

  return gulp.src(src)
    // Set dest path
    .pipe(add_prefix(/package\/fedora20/, 'fedora20'))
    .pipe(add_prefix(/package\/brew/, 'mac'))

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(parallelize(publisher.publish(headers), 10))

    // print upload updates to console
    .pipe(awspublish.reporter());
});
