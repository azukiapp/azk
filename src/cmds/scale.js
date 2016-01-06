import { CliTrackerController } from 'azk/cli/cli_tracker_controller';
import { Helpers } from 'azk/cli/helpers';
import { _, log, t, config, lazy_require } from 'azk';
import { subscribe } from 'azk/utils/postal';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  Status  : 'azk/cmds/status'
});

class Scale extends CliTrackerController {
  index(opts, command_parse_result) {
    return async(this, function* () {

      // if is starting in another destination folder
      // with azk start GIT_URL change cwd
      if (command_parse_result && command_parse_result.git_destination_path) {
        this.cwd = command_parse_result.git_destination_path;
      }

      yield Helpers.requireAgent(this.ui);

      var manifest = new lazy.Manifest(this.cwd, true);

      if (/^\d*$/.test(opts.system) && _.isNull(opts.to)) {
        opts.to     = opts.system;
        opts.system = manifest.systemDefault.name;
      }

      Helpers.manifestValidate(this.ui, manifest);
      var systems = manifest.getSystemsByName(opts.system);
      var result  = yield this[`${this.name}`](manifest, systems, opts);

      var status_systems = manifest.getSystemsByName(
        manifest.systemsInOrder(_.map(systems, (system) => system.name))
      );
      this.ui.output("");
      yield lazy.Status.status(this, manifest, status_systems);

      return result;
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

    this.ui.ok([...keys].concat(event.action), data);
  }

  _scale(system, instances = {}, opts = undefined) {
    var flags    = {};
    var _subscription = subscribe('#.status', (event) => {
      if (!event) { return; }
      var type;
      if (event.type === "pull_msg") {
        var pullProgressBar = Helpers.newPullProgressBar(this.ui);
        pullProgressBar(event);
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

            this.ui.ok([...keys].concat(type), event);
            break;
          case "sync":
            flags.sync = flags.sync || {};
            if (!flags.sync[event.system]) {
              flags.sync[event.system] = true;
              this.ui.ok([...keys].concat(event.type), event);
            }
            log.debug({ log_label: "[scale]", data: event});
            break;
          case "wait_port" :
          case "provision" :
            this.ui.ok([...keys].concat(event.type), event);
            break;
          default:
            log.debug({ log_label: "[scale]", data: event});
        }
      }
    });

    var is_remove = !opts['no-remove'] ? config("docker:remove_container") : !opts['no-remove'];
    var options = {
      build_force    : opts.rebuild || false,
      provision_force: (opts.rebuild ? true : opts.reprovision) || false,
      remove         : is_remove,
    };

    this.verbose_msg(1, () => {
      options = _.merge(options, {
        provision_verbose: true,
        stdout: this.ui.stdout(),
        stderr: this.ui.stderr(),
      });
    });

    this.verbose_msg(2, () => {
      options = _.merge(options, {
        verbose: true
      });
    });

    return system.scale(instances, options)
      .then(function (result) {
        _subscription.unsubscribe();
        return result;
      })
      .catch(function (err) {
        _subscription.unsubscribe();
        throw err;
      });
  }
}

module.exports = Scale;
