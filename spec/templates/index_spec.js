import { async, lazy_require, path } from 'azk';
import h from 'spec/spec_helper';
import { Template } from 'azk/templates';
import { UI } from 'azk/cli/ui';

require('babel/polyfill');

/* global Manifest, Generator */
lazy_require(this, {
  Manifest: ['azk/manifest'],
  Generator() {
    return require('azk/generator').Generator;
  },
});

describe("Azk templates class, main set", function() {
  it("should any", function() {
    return async(this, function* () {
      var dirname = '/media/Data/home/felipe/workspace/azukiapp/azkdemo';
      var manifest = new Manifest(dirname, true);
      var AzkParser = require('azk-parser');
      var azkParserCli = new AzkParser.AzkParserCli();
      var generator = new Generator(this);
      var template = yield Template.fetch(dirname + '/ngrok.js', UI);
      var systems = yield template.process(manifest);
      var tmpFile = path.join('/tmp', 'tmp_Azkfile.js');
      generator.render({ systems: systems }, tmpFile);
      yield azkParserCli.add(path.join(manifest.manifestPath, 'Azkfile.js'), tmpFile);
      h.expect(true).is.ok;
    });
  });
});
