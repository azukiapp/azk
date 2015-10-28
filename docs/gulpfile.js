var gulp = require('gulp');
var replace = require('gulp-replace');
var shell = require('gulp-shell')
var del = require('del');
var runSequence = require('run-sequence');

// Load envs from .env files
var dotenv = require('dotenv');
dotenv.load();

// Configs for deploy
var configs = {
  deploy: {
    bucket: process.env.AWS_BUCKET_STAGE
  }
};

gulp.task('del-wrong-gitbook-folder', function (cb) {
  return del([
    'content/_book/gitbook',
  ], cb);
});

gulp.task('del-all-gitbook-folders', function (cb) {
  return del([
    'content/_book/gitbook',
    'content/_book/en/gitbook',
    'content/_book/pt-BR/gitbook',
  ], cb);
});

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
    .pipe(replace(/GA_COOKIE_DOMAIN/gm, process.env.GA_COOKIE_DOMAIN))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('copy-readme-to-index', function() {
  var rename = require("gulp-rename");
  return gulp.src(['./content/_book/**/README.html'])
    .pipe(rename({
      basename: 'index'
    }))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('replace-readme-to-index', function() {
  return gulp.src([
      './content/_book/**/*.html',
      './content/_book/**/*.js',
      './content/_book/**/*.json'
    ])
    .pipe(replace(/README\.html/gm, ''))
    .pipe(gulp.dest('./content/_book'));
});

// Deploying zipped files
gulp.task('publish-stage-gz', function() {
  var awspublish  = require("gulp-awspublish");
  var parallelize = require("concurrent-transform");
  var awspublishRouter = require("gulp-awspublish-router");

  // create a new publisher
  var publisher = awspublish.create({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_KEY,
    bucket: configs.deploy.bucket,
    region: 'sa-east-1',
  });

  var src = './content/_book/**/*.*';

  return gulp.src(src)
    .pipe(awspublishRouter({
      routes: {
        "^(.*)README\.html$": {
          headers: {
            "Content-Type": "text/html",
            "x-amz-website-redirect-location": "/$1"
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

gulp.task('build-gitbook', shell.task([
  'azk nvm gitbook build content'
]));

gulp.task('override-landingpage', function(callback){
  return gulp.src('./content-override/index.html')
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('deploy-prod', function(callback) {
  configs.deploy.bucket = process.env.AWS_BUCKET_PROD;

  runSequence('build-gitbook',
              'copy-readme-to-index',
              'replace-readme-to-index',
              'del-wrong-gitbook-folder',
              'replace-font-path-pt-BR',
              'replace-font-path-en',
              'override-landingpage',
              'replace-ga-tokens',
              'publish-stage-gz',
              callback);
});

gulp.task('deploy-stage', function(callback) {
  runSequence('build-gitbook',
              'copy-readme-to-index',
              'replace-readme-to-index',
              'del-wrong-gitbook-folder',
              'replace-font-path-pt-BR',
              'replace-font-path-en',
              'override-landingpage',
              'publish-stage-gz',
              callback);
});

gulp.task('build', function(callback) {
  runSequence(
              'build-gitbook',
              'copy-readme-to-index',
              'replace-readme-to-index',
              'override-landingpage',
              callback);
});

gulp.task('default', ['build']);

