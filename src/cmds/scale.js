import { log, _, async, t, lazy_require } from 'azk';
import { Helpers } from 'azk/cli/command';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Cmd as StatusCmd } from 'azk/cmds/status';

/* global Manifest */
lazy_require(this, {
  Manifest: ['azk/manifest'],
});

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent(this);

      var manifest = new Manifest(this.cwd, true);
      Helpers.manifestValidate(this, manifest);
      var systems = manifest.getSystemsByName(opts.system);

      yield this[`${this.name}`](manifest, systems, opts);

      this.output("");
      yield StatusCmd.status(this, manifest, systems);
    });
  }

  scale(manifest, systems, opts) {
    return async(this, function* () {
      for (var i = 0; i < systems.length; i++) {
        var system = systems[i];
        yield this._scale(system, parseInt(opts.to || 1), opts);
      }
    });
  }

  _formatAction(keys, event, system) {
    this.images_checked = this.images_checked || {};

    var data = { image: system.image.name };
    if (event.action == "check_image") {
      if (this.images_checked[data.image]) {
        return null;
      }
      this.images_checked[data.image] = true;
    }

    this.ok([...keys].concat(event.action), data);
  }

  _scale(system, instances = {}, opts = undefined) {
    var progress = (event) => {
      var type;
      var pull_progress = Helpers.newPullProgress(this);
      if (event.type === "pull_msg") {
        pull_progress(event);
      } else {
        var keys = ["commands", "scale"];
        switch (event.type) {
          case "action":
            this._formatAction(keys, event, system);
            break;
          case "scale":
            event.instances = t([...keys].concat("instances"), event);
            if (this.name != "scale") {
              type = event.from > event.to ? "stopping" : "starting";
            } else {
              type = event.from > event.to ? "scaling_down" : "scaling_up";
            }

            this.ok([...keys].concat(type), event);
            break;
          case "wait_port":
          case "provision":
            this.ok([...keys].concat(event.type), event);
            break;
          default:
            log.debug(event);
        }
      }
    };

    var options = {
      build_force: opts.rebuild || false,
      provision_force: (opts.rebuild ? true : opts.reprovision) || false,
      remove: opts.remove,
    };

    this.verbose_msg(1, () => {
      options = _.merge(options, {
        provision_verbose: true,
        stdout: this.stdout(),
        stderr: this.stderr(),
      });
    });

    return system.scale(instances, options).progress(progress);
  }
}

export { Cmd };
export function init(cli) {
  return (new Cmd('scale [system] [to]', cli))
    .addOption(['--remove', '-r'], { default: true });
}
