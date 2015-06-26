import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { promiseResolve } from 'azk/utils/promises';

describe('Azk cli, start controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('start', null, (params={}) => {
      ui.output(`starting \`${params.system}\`...`);
      return promiseResolve(0);
    });

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: h.fixture_path('slim-app'), just_parse: true };

  it('should run a `start example` command', function() {
    doc_opts.argv = ['start', 'example'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('start',  true);
      h.expect(options).to.have.property('system', 'example');
      h.expect(outputs[0]).to.match(RegExp('starting `example`...', 'gi'));
    });
  });

  describe('start git-repo:', function () {
    var cli;
    before(function () {
      cli = new Cli(cli_options)
        .route('start');
    });

    it('should ref=master with git-repo argument only', function() {
      doc_opts.argv = ['start', 'git@github.com:azukiapp/azkdemo.git'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'git@github.com:azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'master');
      });
    });

    it('should ref=master with --git-ref', function() {
      doc_opts.argv = ['start', 'git@github.com:azukiapp/azkdemo.git',
                       '--git-ref', 'master'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'git@github.com:azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'master');
      });
    });

    it('should ref=dev with git-repo argument only', function() {
      doc_opts.argv = ['start', 'git@github.com:azukiapp/azkdemo.git#dev'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'git@github.com:azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'dev');
      });
    });

    it('should ref=dev with --git-ref', function() {
      doc_opts.argv = ['start', 'git@github.com:azukiapp/azkdemo.git',
                       '--git-ref', 'dev'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'git@github.com:azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'dev');
      });
    });

    it('should ref=dev with --git-ref and repo#ref', function() {
      doc_opts.argv = ['start', 'git@github.com:azukiapp/azkdemo.git#master',
                       '--git-ref', 'dev'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'git@github.com:azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'dev');
      });
    });

    it('should get a full git https url with only user/repo', function() {
      doc_opts.argv = ['start', 'azukiapp/azkdemo'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'https://github.com/azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'master');
      });
    });

    it('should set destination path', function() {
      doc_opts.argv = ['start', 'azukiapp/azkdemo', 'DEST_FOLDER'];

      cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((parsed_options) => {

        h.expect(parsed_options).to.have.property('git_url',
                                                  'https://github.com/azukiapp/azkdemo.git');

        h.expect(parsed_options).to.have.property('git_branch_tag_commit',
                                                  'master');

        h.expect(parsed_options).to.have.property('git_destination_path',
                                                  'DEST_FOLDER');
      });
    });

  });

});
