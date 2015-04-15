'use strict';

module.exports = function(grunt) {
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

    watch: {
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
        tasks: ['clear', 'exec:integration-test']
      }
    },

    exec: {
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

  });

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  // Clear task
  grunt.registerTask('clear', function() {
    process.stdout.write('\u001B[2J\u001B[0;0f');
  });

  grunt.registerTask('publish'    , ['env:aws', 'exec:publish_package']);
  grunt.registerTask('integration', ['exec:integration-test']);
};
