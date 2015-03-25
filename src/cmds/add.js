// import { _, async, config, fs, path, lazy_require, log } from 'azk';
import { async, lazy_require, path } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';
import { Template } from 'azk/templates';

require('babel/polyfill');

/* global Manifest, Generator */
lazy_require(this, {
  Manifest: ['azk/manifest'],
  Generator() {
    return require('azk/generator').Generator;
  },
});

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      // TOOD: Should not require agent
      yield Helpers.requireAgent(this);

      var generator = new Generator(this);

      var manifest = new Manifest(this.cwd, true);
      Helpers.manifestValidate(this, manifest);

      // TOOD: Get template from a url
      var template = yield Template.fetch(opts.template, this);
      var systems = yield template.process(manifest);

      var tmpFile = path.join('/tmp', 'tmp_Azkfile.js');
      generator.render({ systems: systems }, tmpFile);

      var AzkParser = require('azk-parser');
      var azkParserCli = new AzkParser.AzkParserCli();
      return yield azkParserCli.add(path.join(manifest.manifestPath, 'Azkfile.js'), tmpFile);
    });
  }
}

export function init(cli) {
  return new Cmd('add {*template}', cli);
}
