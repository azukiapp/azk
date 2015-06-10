import { _, lazy_require, path } from 'azk';
import { CliController } from 'cli-router';
import { Helpers } from 'azk/cli/command';
import { Template } from 'azk/templates';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  Generator() {
    return require('azk/generator').Generator;
  },
});

class Add extends CliController {
  index(params) {
    return async(this, function* () {
      // TOOD: Should not require agent
      yield Helpers.requireAgent(this.ui);

      var generator = new lazy.Generator(this.ui);

      var manifest = new lazy.Manifest(this.cwd, true);
      Helpers.manifestValidate(this.ui, manifest);

      // TOOD: Get template from a url
      var template    = yield Template.fetch(params.template, this.ui);
      var proc_result = yield template.process(manifest);

      var tmpFile = path.join('/tmp', 'tmp_Azkfile.js');
      generator.render({ systems: proc_result.systems }, tmpFile);

      var AzkParser = require('azk-parser');
      var azkParserCli = new AzkParser.AzkParserCli();
      var file = path.join(manifest.manifestPath, 'Azkfile.js');
      var result = yield azkParserCli.add(file, tmpFile, proc_result.depends);

      _.each(proc_result.systems, (system, name) => {
        this.ui.ok('commands.add.system_add', { system: name, file: manifest._file_relative() });
      });

      return result;
    });
  }
}

module.exports = Add;
