// import { _, async, config, fs, path, lazy_require, log } from 'azk';
import { async, lazy_require } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';
import { Template } from 'azk/templates';

/* global Manifest */
lazy_require(this, {
  Manifest: ['azk/manifest'],
});

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      // TOOD: Should not require agent
      yield Helpers.requireAgent(this);

      var manifest = new Manifest(this.cwd, true);
      Helpers.manifestValidate(this, manifest);

      // TOOD: Get template from a url
      var template = yield Template.fetch(opts.template, this);
      console.log(yield template.process());

      return true;
    });
  }
}

export function init(cli) {
  return new Cmd('add {*template}', cli);
}
