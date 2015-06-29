import h from 'spec/spec_helper';
import { GetProject } from 'azk/manifest/get_project';
import { Cli } from 'azk/cli';

describe('GetProject:', function() {

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
      return GetProject.parseCommandOptions(cli_options);
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

  describe('_parseGitLsRemoteResult:', function () {

    var outputs = [];
    var ui      = h.mockUI(beforeEach, outputs);
    var getProject = new GetProject(ui);

    it('should get commit and branch', function() {
      var input_string = [
        '284b608a5b9301c3df8e4ddcf371ff74eec2d754	HEAD',
        '24af92c4701b6bb45c314e8b62be785b595ba74f	refs/heads/feature/adding_services',
        '9fa9093f65e110ae036341861c0e8801e03591e1	refs/heads/final',
        '284b608a5b9301c3df8e4ddcf371ff74eec2d754	refs/heads/master',
        'b6852f0c25461b2cc376b5339975a16747b412f8	refs/heads/two',
        'f1ae4ba97ac97e615bb3e0d718e0565c3d303dcb	refs/tags/v0.1.2',
        'b6852f0c25461b2cc376b5339975a16747b412f8	refs/tags/v0.1.2^{}',
      ].join('\n');

      var parsed_result = getProject._parseGitLsRemoteResult(input_string);

      h.expect(parsed_result).to.containSubset([
        {
          commit: '284b608a5b9301c3df8e4ddcf371ff74eec2d754',
          git_ref: 'HEAD'
        },
        {
          commit: '24af92c4701b6bb45c314e8b62be785b595ba74f',
          git_ref: 'feature/adding_services'
        },
        {
          commit: '9fa9093f65e110ae036341861c0e8801e03591e1',
          git_ref: 'final'
        },
        {
          commit: '284b608a5b9301c3df8e4ddcf371ff74eec2d754',
          git_ref: 'master'
        },
        {
          commit: 'b6852f0c25461b2cc376b5339975a16747b412f8',
          git_ref: 'two'
        },
        {
          commit: 'f1ae4ba97ac97e615bb3e0d718e0565c3d303dcb',
          git_ref: 'v0.1.2'
        },
        {
          commit: 'b6852f0c25461b2cc376b5339975a16747b412f8',
          git_ref: 'v0.1.2^{}'
        },
      ]);
    });

  });

  describe('_isBranchOrTag:', function () {

    var outputs = [];
    var ui      = h.mockUI(beforeEach, outputs);
    var getProject = new GetProject(ui);

    it('should get commit and branch', function() {
      var input_array = [
        {
          commit: '284b608a5b9301c3df8e4ddcf371ff74eec2d754',
          git_ref: 'HEAD'
        },
        {
          commit: '24af92c4701b6bb45c314e8b62be785b595ba74f',
          git_ref: 'feature/adding_services'
        },
        {
          commit: '9fa9093f65e110ae036341861c0e8801e03591e1',
          git_ref: 'final'
        },
        {
          commit: '284b608a5b9301c3df8e4ddcf371ff74eec2d754',
          git_ref: 'master'
        },
        {
          commit: 'b6852f0c25461b2cc376b5339975a16747b412f8',
          git_ref: 'two'
        },
        {
          commit: 'f1ae4ba97ac97e615bb3e0d718e0565c3d303dcb',
          git_ref: 'v0.1.2'
        },
        {
          commit: 'b6852f0c25461b2cc376b5339975a16747b412f8',
          git_ref: 'v0.1.2^{}'
        },
      ];

      h.expect(getProject._isBranchOrTag(input_array, 'two')).to.be.true;
      h.expect(getProject._isBranchOrTag(input_array, 'v0.1.2')).to.be.true;
      h.expect(getProject._isBranchOrTag(input_array, 'HEAD')).to.be.true;
      h.expect(getProject._isBranchOrTag(input_array, 'NONE')).to.be.false;

    });

  });

});
