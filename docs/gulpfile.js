var gulp = require('gulp');
var awspublish = require('gulp-awspublish');
var parallelize = require("concurrent-transform");
var replace = require('gulp-replace');
var shell = require('gulp-shell')
var del = require('del');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");

// Load envs from .env files
var dotenv = require('dotenv');
dotenv.load();

// Configs for deploy
var configs = {
  deploy: {
    bucket: process.env.AWS_BUCKET_STAGE,
    mixpanel_expand: false,
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

gulp.task('replace-mixpanel-token', function() {
  return gulp.src(['./content/_book/**/*.html'])
    .pipe(replace(/MIXPANEL_TOKEN/gm, process.env.MIXPANEL_TOKEN))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('rename-readme-to-index', function() {
  return gulp.src(['./content/_book/**/README.html'])
    .pipe(rename(function(path) {
      path.basename = 'index';
    }))
    .pipe(gulp.dest('./content/_book'));
});

gulp.task('replace-readme-to-index', function() {
  return gulp.src([
      './content/_book/**/*.html',
      './content/_book/**/*.js',
      './content/_book/**/*.json'
    ])
    .pipe(replace(/README\.html/gm, 'index.html'))
    .pipe(gulp.dest('./content/_book'));
});

// Deploying zipped files
gulp.task('publish-stage-gz', function() {
  // create a new publisher
  var publisher = awspublish.create({
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_KEY,
    bucket: configs.deploy.bucket,
    region: 'sa-east-1',
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public',
    'Content-Encoding': 'gzip',
    // ...
  };

  var src = './content/_book/**/*.*';

  return gulp.src(src)
    // Only newer files
    // .pipe(newer(src))

     // gzip, Set Content-Encoding headers and add .gz extension
    .pipe(awspublish.gzip())

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(parallelize(publisher.publish(headers), 10))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    // print upload updates to console
    .pipe(awspublish.reporter());
});

gulp.task('build', shell.task([
  'azk nvm gitbook build content'
]));

gulp.task('deploy-prod', function(callback) {
  configs.deploy.bucket = process.env.AWS_BUCKET_PROD;

  runSequence('build',
              'del-wrong-gitbook-folder',
              'replace-style.css-path-on-index',
              'replace-font-path-pt-BR',
              'replace-font-path-en',
              'replace-readme-to-index',
              'rename-readme-to-index',
              'replace-mixpanel-token',
              'publish-stage-gz',
              callback);
});

gulp.task('deploy-stage', function(callback) {
  runSequence('build',
              'del-wrong-gitbook-folder',
              'replace-style.css-path-on-index',
              'replace-font-path-pt-BR',
              'replace-font-path-en',
              'replace-readme-to-index',
              'rename-readme-to-index',
              'publish-stage-gz',
              callback);
});

gulp.task('default', ['build']);
