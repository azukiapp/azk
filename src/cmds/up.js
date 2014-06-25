import { log, _, async, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent();
      var manifest = new Manifest(this.cwd, true);

      //var systems = manifest.systemInSequence;
      //_.each(systems, )
    });
  }
}

export function init(cli) {
  return new Cmd('up', cli);
}
