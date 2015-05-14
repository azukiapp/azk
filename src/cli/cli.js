import Azk from 'azk';
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
    this._version = `azk ${Azk.version}`;
    this.mapArgs = {
      '--help'   : 'help',
      '-h'       : 'help',
      '--version': 'version'
    };
  }

  normalizeArgs(args = {}) {
    var map = this.mapArgs;
    args = _.map(_.flatten([ args ]), function(arg) {
      return (_.has(map, arg)) ? map[arg] : arg;
    });
    return args;
  }

  docopt(docopts={}) {
    docopts = _.defaults(docopts, { help: false });
    docopts.argv = this.normalizeArgs(docopts.argv);

    var result;
    try {
      result = super.docopt(docopts);
    } catch (e) {
      var command = docopts.argv.join();
      throw new InvalidCommandError(command);
    }
    return result;
  }
}
