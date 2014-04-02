var gulp    = require('gulp');
var traceur = require('gulp-traceur');
var mocha   = require('gulp-mocha');
var plumber = require('gulp-plumber');
var shell   = require('gulp-shell')

var insttaled_key = false;
function key_watch() {
  if (insttaled_key) return false;
  insttaled_key = true;
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

var watching = false;
function onError(err) {
  console.log("\n");
  console.log(err.stack);
  console.log("\n");
  if (watching) {
    this.emit('end');
  } else {
    // if you want to be really specific
    process.exit(1);
  }
}

gulp.task('clear', shell.task([
  "clear",
]))

gulp.task('traceur-source', function(cb) {
  var dest = 'build/azk';
  return gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(traceur({dest: dest, sourceMap: true}))
    .pipe(gulp.dest(dest));
});

gulp.task('traceur-spec', function(cb) {
  var dest = 'build/spec';
  return gulp.src('spec/**/*.js')
    .pipe(plumber())
    .pipe(traceur({dest: dest, sourceMap: true}))
    .pipe(gulp.dest(dest));
});

gulp.task('traceur', ['traceur-source', 'traceur-spec']);
gulp.task('mocha', ['traceur'], function() {
  return gulp.src('build/spec/**/*.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }).on("error", onError));
});

gulp.task('watching', function() {
  watching = true;
  key_watch();
  return gulp.watch(['spec/**/*.js', 'src/**/*.js'], ['clear', 'mocha']);
});

gulp.task('default', ['watching', 'mocha']);
