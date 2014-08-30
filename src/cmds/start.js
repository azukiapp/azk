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
    this.fail('commands.reload.deprecation');
    return this.restart(manifest, systems, opts);
  }

  restart(manifest, systems, opts) {
    return async(this, function* () {
      yield this.stop(manifest, systems, opts);
      yield this.start(manifest, systems, opts);
    });
  }
}

export function init(cli) {
  var cmds = [
    (new Cmd('start [system]' , cli))
      .addOption(['--reprovision', '-R'], { default: false }),
    (new Cmd('stop [system]'  , cli))
      .addOption(['--remove', '-r'], { default: true }),
    (new Cmd('restart [system]', cli))
      .addOption(['--reprovision', '-R'], { default: false }),
    (new Cmd('reload [system]', cli))
      .addOption(['--reprovision', '-R'], { default: true }),
  ];
}
