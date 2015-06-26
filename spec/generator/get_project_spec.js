import h from 'spec/spec_helper';
import { GetProject } from 'azk/manifest/get_project';
import { Cli } from 'azk/cli';

describe('GetProject:', function() {
  var outputs = [];

  // GetProject with mocked UI
  var ui      = h.mockUI(beforeEach, outputs);
  var getProject = new GetProject(ui);

  describe('parseCommandOptions:', function () {
    // cli-router to parse arguments
    var cli_options = {};
    var cli = new Cli(cli_options);

    // parse arguments with parseCommandOptions
    var cliRouterCleanParams = function (command_args) {
      var doc_opts    = { exit: false };
      doc_opts.argv = command_args.split(' ').splice(1);

      // parsed arguments
      var cli_options = cli.router.cleanParams(cli.docopt(doc_opts));

      // azk start git repo parsed arguments
      return getProject.parseCommandOptions(cli_options);
    };

    it('should ref=master with git-repo argument only', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start git@github.com:azukiapp/azkdemo.git'
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                      'git@github.com:azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                      'master');
    });

    it('should ref=master with --git-ref', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start git@github.com:azukiapp/azkdemo.git',
        '--git-ref master',
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                                'git@github.com:azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                'master');
    });

    it('should ref=dev with git-repo argument only', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start git@github.com:azukiapp/azkdemo.git#dev'
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                                'git@github.com:azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                'dev');
    });

    it('should ref=dev with --git-ref', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start git@github.com:azukiapp/azkdemo.git',
        '--git-ref dev'
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                                'git@github.com:azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                'dev');
    });

    it('should ref=dev with --git-ref and repo#ref', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start git@github.com:azukiapp/azkdemo.git#master',
        '--git-ref dev'
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                                'git@github.com:azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                'dev');
    });

    it('should get a full git https url with only user/repo', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start azukiapp/azkdemo'
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                                'https://github.com/azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                'master');
    });

    it('should set destination path', function() {
      var parsed_options = cliRouterCleanParams([
        'azk start azukiapp/azkdemo DEST_FOLDER'
      ].join(' '));

      h.expect(parsed_options).to.have.property('git_url',
                                                'https://github.com/azukiapp/azkdemo.git');

      h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                'master');

      h.expect(parsed_options).to.have.property('git_destination_path',
                                                'DEST_FOLDER');
    });

  });

});
