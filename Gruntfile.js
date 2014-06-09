'use strict';

function key_watch(grunt) {
  var keypress = require('keypress');
  var stdin = process.openStdin();
  var touch = require('touch');

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
      return process.exit();
    } else if(key && key.name == "r") {
      // Reload
      touch(__filename);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // ENV's
    env: {
      test: {
        NODE_ENV: "test",
      }
    },

    // Configuration to be run (and then tested).
    traceur: {
      options: {
        sourceMaps: true,
        modules: 'commonjs'
      },
      source: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js', '!share/*.js'],
          dest: 'lib/azk/',
          ext: '.js'
        }]
      },
      spec: {
        files: [{
          expand: true,
          cwd: 'spec/',
          src: '**/*.js',
          dest: 'lib/spec/',
          ext: '.js'
        }]
      }
    },

    exec: {
      clear: {
        cmd: 'clear'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 5000
        },
        src: ['lib/spec/**/*_spec.js']
      }
    },

    watch: {
      spec: {
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          '!src/share/*.js',
          'spec/**/*.js',
        ],
        tasks: ['test']
      },

      traceur: {
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          '!src/share/*.js',
          'spec/**/*.js',
        ],
        tasks: ['exec:clear', 'newer:traceur']
      }
    },
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-traceur');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['env:test', 'exec:clear', 'newer:traceur', 'mochaTest']);
  grunt.registerTask('compile', ['exec:clear', 'newer:traceur', 'watch:traceur']);
  grunt.registerTask('default', function() {
    key_watch(grunt);
    return grunt.task.run(['test', 'watch:spec']);
  });
};
