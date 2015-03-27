'use strict';

function key_watch() {
  var keypress = require('keypress');
  var touch = require('touch');

  // make `process.stdin` begin emitting 'keypress' events
  keypress(process.stdin);

  // listen for the 'keypress' event
  process.stdin.on('keypress', function (ch, key) {
    if (key) {
      if (key.ctrl && key.name == 'c') {
        process.stdin.pause();
        return process.exit();
      } else if (key.name == 'c') {
        process.stdout.write('\u001B[2J\u001B[0;0f');
      } else if (key.name == 'r') {
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
  var test_task = grunt.option('test') || 'test';
  var test_grep = grunt.option('grep') || null;
  if (test_grep !== null) {
    test_task = 'slow_test';
  }

  // Lib path
  var lib = process.env.AZK_LIB_PATH || 'lib';

  // Project configuration.
  grunt.initConfig({
    // ENV's
    env: {
      test: {
        NODE_ENV: 'test',
      },
      aws: {
        src: '.env',
      }
    },

    aws: {
      'accessKeyId' : process.env.AWS_ACCESS_KEY_ID,
      'secretKey'   : process.env.AWS_SECRET_KEY,
      'bucket'      : process.env.AWS_BUCKET,
    },

    aws_s3: {
      options: {
        accessKeyId         : '<%= aws.accessKeyId %>',
        secretAccessKey     : '<%= aws.secretKey %>',
        region              : 'sa-east-1',
        uploadConcurrency   : 5,
        downloadConcurrency : 5,
        bucket              : '<%= aws.bucket %>',
        differential        : true,
        displayChangesOnly  : true,
      },
      publish_package: {
        files: [
          {expand: true, cwd: './package/brew', src: ['*.tar.gz'], dest: './mac/', stream: true },
          {expand: true, cwd: './package/public', src: ['./!(fedora20)/**/*'], stream: true },
          {expand: true, cwd: './package/fedora20', src: ['**/*'], dest: './fedora20/', stream: true },
          //{expand: true, cwd: './src/libexec/gpg', src: ['azuki.asc'], dest: './keys/', stream: true },
        ],
      },
    },

    // Downloads
    'curl-dir': {
      'brace-expansion': {
        src: [ 'https://s3-sa-east-1.amazonaws.com/azk/debian2docker/azk{.iso,-agent.vmdk.gz}' ],
        dest: lib + '/vm',
      },
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
          src: ['**/*.js'],
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
          grep: '@slow',
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
        options: {
          atBegin: true,
        },
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
        ],
        tasks: [test_task]
      },

      traceur: {
        options: {
          atBegin: true,
        },
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
        ],
        tasks: ['clear', 'build']
      },

      'integration': {
        options: {
          atBegin: true,
        },
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
          'spec/integration/**/*.bats',
          'spec/integration/**/*.bash',
        ],
        tasks: ['build', 'clear', 'exec:integration-test']
      }
    },

    exec: {
      'build': {
        'cmd': function(system) {
          return 'azk shell ' +
            system +
            ' --shell=/bin/bash -c "azk nvm grunt newer:traceur"';
        },
      },
      'publish_package': {
        'cmd': 'grunt aws_s3:publish_package'
      },
      'integration-test': {
        cmd: function() {
          var filter = 'find spec/integration -name \'*.bats\'';
          if (test_grep) {
            filter = 'grep -Rl "' + test_grep + '" spec/integration';
          }
          return lib + '/bats/bin/bats `' + filter + '`';
        }
      }
    },

    jshint: {
      all: {
        src: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
        ]
      },
      options: {
        jshintrc: true
      }
    },

    jscs: {
      all: {
        src: [
          'Gruntfile.js',
          'src/**/*.js',
          'spec/**/*.js',
        ],
      },
      options: {
        config: '.jscsrc'
      }
    },

    notify_hooks: {
      options: {
        enabled: true,
        max_jshint_notifications: 2, // maximum number of notifications from jshint output
        success: false, // whether successful grunt executions should be notified automatically
        duration: 2 // the duration of notification in seconds, for `notify-send only
      }
    },

  });

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  // Clear task
  grunt.registerTask('clear', function() {
    process.stdout.write('\u001B[2J\u001B[0;0f');
  });

  grunt.registerTask('vm-download', ['curl-dir:brace-expansion' ]);
  grunt.registerTask('test'       , ['env:test', 'build', 'clear', 'mochaTest:test']);
  grunt.registerTask('slow_test'  , ['env:test', 'build', 'clear', 'mochaTest:slow_test']);
  grunt.registerTask('build'      , ['hint', 'newer:traceur']);
  grunt.registerTask('compile'    , ['watch:traceur']);
  grunt.registerTask('inspector'  , ['node-inspector']);
  grunt.registerTask('hint'       , ['newer:jshint', 'newer:jscs']);
  grunt.registerTask('publish'    , ['env:aws', 'exec:publish_package']);
  grunt.registerTask('integration', ['build', 'exec:integration-test']);
  grunt.registerTask('default'    , function() {
    key_watch(grunt);
    return grunt.task.run(['watch:spec']);
  });
};
