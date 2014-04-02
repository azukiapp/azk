var gulp    = require('gulp');
var traceur = require('gulp-traceur');
var mocha   = require('gulp-mocha');
var plumber = require('gulp-plumber');
var shell   = require('gulp-shell')

function key_watch() {
  var keypress = require('keypress');
  var stdin = process.openStdin();

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
      return process.exit();
    }

    if (key) {
      switch(key.name) {
        case "r":
          gulp.run(['clear', 'mocha']);
          break;
        case "c":
          gulp.run('clear');
          break;
      }
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

gulp.task('clear', shell.task([
  "clear",
]))

gulp.task('traceur-source', function(cb) {
  return gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(traceur({sourceMaps: true, sourceMap: true}))
    .pipe(gulp.dest('build/azk'));
});

gulp.task('traceur-spec', function(cb) {
  return gulp.src('spec/**/*.js')
    .pipe(plumber())
    .pipe(traceur({sourceMaps: true, sourceMap: true}))
    .pipe(gulp.dest('build/spec'));
});

gulp.task('traceur', ['traceur-source', 'traceur-spec']);
gulp.task('mocha', ['traceur'], function() {
  return gulp.src('build/spec/**/*.js')
    .pipe(plumber())
    .pipe(mocha({ reporter: 'spec' }));
});

var default_tasks = ['clear', 'mocha'];
gulp.task('default', default_tasks, function() {
  gulp.watch(['spec/**/*.js', 'src/**/*.js'], default_tasks);
  key_watch();
});
