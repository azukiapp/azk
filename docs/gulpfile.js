var gulp = require('gulp');
var replace = require('gulp-replace');
var shell = require('gulp-shell')
var del = require('del');
var runSequence = require('run-sequence');

// Load envs from .env files
var dotenv = require('dotenv');
dotenv.load();

gulp.task('replace-font-path-pt-BR', function(){
  return gulp.src(['./content/_book/pt-BR/gitbook/print.css',
            './content/_book/pt-BR/gitbook/style.css',])
    .pipe(replace(/\.\/\/fonts/g, './fonts'))
    .pipe(gulp.dest('./content/_book/pt-BR/gitbook/'));
});

gulp.task('replace-font-path-en', function(){
  return gulp.src(['./content/_book/en/gitbook/print.css',
            './content/_book/en/gitbook/style.css',])
    .pipe(replace(/\.\/\/fonts/g, './fonts'))
    .pipe(gulp.dest('./content/_book/en/gitbook/'));
});

gulp.task('replace-style.css-path-on-index', function(){
  return gulp.src(['./content/_book/index.html'])
    .pipe(replace(/gitbook\/style\.css/gm, 'pt-BR/gitbook/style.css'))
    .pipe(gulp.dest('./content/_book/'));
});

gulp.task('replace-ga-tokens', function() {
  return gulp.src(['./content/_book/**/*.html'])
    .pipe(replace(/GA_UA_ID/gm, process.env.GA_UA))
    .pipe(replace(/GA_LEGACY_COOKIE_DOMAIN/gm, process.env.GA_LEGACY_COOKIE_DOMAIN))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('replace-hotjar-token', function() {
  return gulp.src(['./content/_book/**/*.html'])
    .pipe(replace(/12345678901/gm, process.env.HOTJAR_ID))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('copy-index-to-readme', function() {
  var rename = require("gulp-rename");
  return gulp.src(['./content/_book/**/index.html'])
    .pipe(rename({
      basename: 'README'
    }))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('build-gitbook', shell.task([
  'gitbook build content'
]));

gulp.task('override-landingpage', function(callback){
  return gulp.src('./content-override/index.html')
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('build', function(callback) {
  runSequence(
              'build-gitbook',
              'copy-index-to-readme',
              'replace-font-path-pt-BR',
              'replace-font-path-en',
              'override-landingpage',
              callback);
});

// Deploying zipped files
// gulp.task('deploy', ['build'], function() {
gulp.task('deploy', function() {
  var awspublish  = require("gulp-awspublish");
  var parallelize = require("concurrent-transform");
  var awspublishRouter = require("gulp-awspublish-router");
  var gulpif = require('gulp-if');

  // Select bucket
  var yargs  = require('yargs');
  var production = yargs.argv.production;
  var bucket = process.env[
    "AWS_BUCKET_" + (production ? "PROD" : "STAGE")
  ];

  // create a new publisher
  var publisher = awspublish.create({
    params: {
      Bucket: bucket,
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'sa-east-1',
  });

  var src = gulp.src(['./content/_book/**/*.*', '!./content/_book/gitbook/**']);
  if (!production) {
    src = src
    // Replacing analytics ua-code
    .pipe(
      gulpif(/.*\.html/, replace(/GA_UA_ID/, process.env.UA_CODE))
    )
    .pipe(
      gulpif(/.*\.html/, replace(/GA_LEGACY_COOKIE_DOMAIN/, process.env.GA_LEGACY_COOKIE_DOMAIN))
    )
    // Replacing hotjar id
    .pipe(
      gulpif(/.*\.html/, replace(/hjid:12345678901/, 'hjid:' + process.env.HOTJAR_ID))
    );
  }

  return src.pipe(awspublishRouter({
      routes: {
        "^(.*)README\.html$": {
          headers: {
            "Content-Type": "text/html",
            "WebsiteRedirectLocation": "/$1"
          }
        },
        "^.+$": {
          cacheTime: 315360000,
          gzip: true,
        }
      }
    }))

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(parallelize(publisher.publish()))

    // Clean remote files
    .pipe(publisher.sync())

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    // print upload updates to console
    .pipe(awspublish.reporter());
});

gulp.task('default', ['build']);

