import { log, _, async, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';
import { Cmd as ScaleCmd } from 'azk/cmds/scale';


class Cmd extends ScaleCmd {
  _scale(systems, action, opts) {
    var options = {
      start: { instances: {}, key: "already" },
      stop:  { instances: 0 , key: "not_running" },
    };
    options = options[action];

    return async(this, function* () {
      var system, result = 0;
      systems = _.clone(systems);

      while(system = systems.shift()) {
        var ns = ["commands", action];

        this.verbose([...ns, "verbose"], system);
        var icc = yield super(system, _.clone(options.instances), opts);

        if (icc == 0) {
          this.fail([...ns, options.key], system);
          result = SYSTEMS_CODE_ERROR;
        }
      };

      return result;
    });
  }

  start(manifest, systems, opts) {
    return this._scale(systems, 'start', opts);
  }

  stop(manifest, systems, opts) {
    systems = systems.reverse();
    return this._scale(systems, 'stop', opts);
  }

  reload(manifest, systems, opts) {
    throw new NotBeenImplementedError('reload');
  }
}

export function init(cli) {
  var cmds = [
    (new Cmd('start [system]' , cli)),
    (new Cmd('stop [system]'  , cli)),
    (new Cmd('reload [system]', cli)),
  ];

  _.each(cmds, (cmd) => {
    cmd.addOption(['--verbose', '-v'], { default: false })
  });
}
