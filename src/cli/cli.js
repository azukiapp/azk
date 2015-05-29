import { _, path, config } from 'azk';
import { Cli as CliRouter } from 'cli-router';
import { InvalidCommandError } from 'azk/utils/errors';

export class Cli extends CliRouter {
  constructor(options = {}) {
    options = _.defaults(options, {
      path            : path.join(config('paths:locales'), `usage-${config('locale')}.txt`),
      controllers_root: path.join(__dirname, "..", "cmds")
    });

    super(options);
  }

  docopt(docopts={}) {
    docopts = _.defaults(docopts, { help: false });

    var result;
    try {
      result = super.docopt(docopts);
    } catch (e) {
      var command = docopts.argv.join(' ');
      throw new InvalidCommandError(command);
    }
    return result;
  }
}
