'use strict';

function key_watch(grunt) {
  var keypress = require('keypress');
  var stdin = process.openStdin();
  var touch = require('touch');

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (key) {
      if (key.ctrl && key.name == 'c') {
        process.stdin.pause();
        return process.exit();
      } else if(key.name == "c") {
        process.stdout.write('\u001B[2J\u001B[0;0f');
      } else if(key.name == "r") {
        // Reload
        touch(__filename);
      }
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

module.exports = function(grunt) {
  // Test options
  var test_task = grunt.option('test') || "test";
  var test_grep = grunt.option('grep') || null;
  if (test_grep != null) {
    test_task = "slow_test";
  }

  // Lib path
  var lib = process.env.AZK_LIB_PATH || "lib";

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
          dest: lib + '/azk/',
          ext: '.js'
        }]
      },
      spec: {
        files: [{
          expand: true,
          cwd: 'spec/',
          src: '**/*.js',
          dest: lib + '/spec/',
          ext: '.js'
        }]
      }
    },

    'node-inspector': {
      dev: {}
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 5000,
          grep: "@slow",
          invert: true,
        },
        src: [lib + '/spec/**/*_spec.js']
      },

      slow_test: {
        options: {
          reporter: 'spec',
          timeout: 50000,
          grep: test_grep,
        },
        src: [lib + '/spec/**/*_spec.js']
      }
    },

    watch: {
      spec: {
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
        ],
        tasks: [test_task]
      },

      traceur: {
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
        ],
        tasks: ['clear', 'newer:traceur']
      }
    },
  });

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  // Clear task
  grunt.registerTask('clear', function() {
    process.stdout.write('\u001B[2J\u001B[0;0f');
  });

  grunt.registerTask('test', ['env:test', 'clear', 'newer:traceur', 'mochaTest:test']);
  grunt.registerTask('slow_test', ['env:test', 'clear', 'newer:traceur', 'mochaTest:slow_test']);
  grunt.registerTask('compile', ['clear', 'newer:traceur', 'watch:traceur']);
  grunt.registerTask('inspector', ["node-inspector"]);
  grunt.registerTask('default', function() {
    key_watch(grunt);
    return grunt.task.run([test_task, 'watch:spec']);
  });
};
