import h from 'spec/spec_helper';
import { lazy_require, path } from 'azk';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  Template: ['azk/templates'],
  UI      : ['azk/cli/ui'],
  Generator() {
    return require('azk/generator').Generator;
  },
});

describe("Azk templates class, main set", function() {
  it("should any", function* () {
    var dirname   = '/Users/nuxlli/Work/azuki/demos/azkdemo';
    var manifest  = new lazy.Manifest(dirname, true);
    var AzkParser = require('azk-parser');
    var azkParserCli = new AzkParser.AzkParserCli();
    var generator = new lazy.Generator(this);
    var template  = yield lazy.Template.fetch(dirname + '/templates/ngrok.js', lazy.UI);
    var systems   = yield template.process(manifest);
    var tmpFile   = path.join('/tmp', 'tmp_Azkfile.js');
    generator.render({ systems: systems }, tmpFile);
    yield azkParserCli.add(path.join(manifest.manifestPath, 'Azkfile.js'), tmpFile);
    h.expect(true).is.ok;
  });
});
