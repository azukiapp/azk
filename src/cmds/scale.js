import { log, _, async, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';
import { Cmd as StatusCmd } from 'azk/cmds/status';

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent();

      var manifest = new Manifest(this.cwd, true);
      var systems  = Helpers.getSystemsByName(manifest, opts.system);

      this.verbose_active = opts.verbose;
      yield this[`${this.name}`](manifest, systems, opts);

      this.output("");
      yield StatusCmd.status(this, manifest, systems);
    });
  }

  verbose(...args) {
    if (this.verbose_active) {
      this.tOutput(...args);
    }
  }

  _formatAction(keys, event, system) {
    this.images_checked = this.images_checked || {};

    var data = { image: system.image.name };
    if (event.action == "check_image") {
      if (this.images_checked[data.image])
        return null;
      this.images_checked[data.image] = true;
    }

    this.tOutput([...keys, event.action], data);
  }

  _scale(system, instances = {}) {
    var progress = (event) => {
      var pull_progress = Helpers.newPullProgress(this);
      if (event.type == "pull_msg") {
        pull_progress(event);
      } else {
        var keys = ["commands", "scale"];
        switch(event.type) {
          case "action":
            this._formatAction(keys, event, system);
            break;
          case "scale":
          case "provision":
            this.tOutput([...keys, event.type], event);
            break;
          default:
            log.debug(event);
        }
      }
    }

    return system.scale(instances, {}).progress(progress);
  }

  scale(manifest, systems, opts) {
    return async(this, function* () {
      for (var i = 0; i < systems.length; i++) {
        var system = systems[i];
        yield this._scale(system, parseInt(opts.to || 1));
      }
    })
  }
}

export { Cmd };
export function init(cli) {
  (new Cmd('scale [system] [to]', cli))
    .addOption(['--verbose', '-v'], { defaut: false })
}

