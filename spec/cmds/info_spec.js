import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { config } from 'azk';
import { ManifestRequiredError } from 'azk/utils/errors';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  chalk    : 'chalk',
});

describe('Azk cli, info controller, run in an', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('info');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  describe("invalid SoS dir", function() {
    it("should return error if not have manifest", function() {
      return h.tmp_dir().then((dir) => {
        doc_opts.argv   = ['info'];
        run_options.cwd = dir;
        var options = cli.router.cleanParams(cli.docopt(doc_opts));
        h.expect(options).to.have.property('info', true);
        return h.expect(cli.run(doc_opts, run_options)).to.rejectedWith(ManifestRequiredError);
      });
    });
  });

  describe("valid SoS dir", function() {
    var manifest;

    before(() => {
      var data = { };
      return h.mockManifest(data).then((mf) => {
        manifest = mf;
      });
    });

    it("should show systems information no colored", function() {
      doc_opts.argv   = `info --no-colored`.split(' ');
      run_options.cwd = manifest.manifestPath;
      var options = cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('info', true);
        h.expect(options).to.have.property('no-colored', true);
        h.expect(outputs[0]).to.match(/^manifest/);
      });
    });

    it("should show systems information", function() {
      doc_opts.argv   = ['info'];
      run_options.cwd = manifest.manifestPath;
      var options = cli.router.cleanParams(cli.docopt(doc_opts));
      h.expect(options).to.have.property('info', true);
      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);

        var rx_color = /^\u001b\[32mmanifest/;
        h.expect(outputs[0]).to.match(rx_color);

        var rx_manifest = RegExp("manifest:.*" + h.escapeRegExp(manifest.file));
        h.expect(outputs[0]).to.match(rx_manifest);

        var rx_manifest_id = RegExp("manifest_id:.*" + h.escapeRegExp(manifest.namespace));
        h.expect(outputs[0]).to.match(rx_manifest_id);

        var rx_cache = RegExp("cache_dir:.*" + h.escapeRegExp(manifest.cache_dir));
        h.expect(outputs[0]).to.match(rx_cache);

        var rx_default = RegExp("default_system:.*" + h.escapeRegExp(manifest.default_system));
        h.expect(outputs[0]).to.match(rx_default);

        var rx_name = RegExp(`${h.escapeRegExp(lazy.chalk.yellow("example"))}:`);
        h.expect(outputs[0]).to.match(rx_name);

        h.expect(outputs[0]).to.match(RegExp(config('docker:image_default')));
        h.expect(outputs[0]).to.match(/command:.*socat/);
      });
    });
  });
});
