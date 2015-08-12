import { CliTrackerController } from 'azk/cli/cli_tracker_controller';
import { Helpers } from 'azk/cli/helpers';
import { _, log, t, lazy_require } from 'azk';
import { subscribe } from 'azk/utils/postal';
import { async } from 'azk/utils/promises';
import { AzkError } from 'azk/utils/errors';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  Status  : 'azk/cmds/status',
  GetProject: ['azk/manifest/get_project'],
});

class Scale extends CliTrackerController {
  index(opts) {
    return async(this, function* () {

      // GetProject: clone and start a project from a git repo
      var command_parse_result = lazy.GetProject.parseCommandOptions(opts);
      if (command_parse_result) {
        var getter = new lazy.GetProject(this.ui, command_parse_result);
        this.cwd = yield getter.startProject(command_parse_result);
        opts.system = null;
      }

      yield Helpers.requireAgent(this.ui);

      var manifest = new lazy.Manifest(this.cwd, true);

      if (/^\d*$/.test(opts.system) && _.isNull(opts.to)) {
        opts.to     = opts.system;
        opts.system = manifest.systemDefault.name;
      }

      Helpers.manifestValidate(this.ui, manifest);
      var systems = manifest.getSystemsByName(opts.system);
      var status_systems = _.map(systems, (system) => {
        var result = [system];
        if (!_.isEmpty(system.depends)) {
          result = result.concat(
            _.map(system.depends, (depend) => {
              return manifest.getSystemsByName(depend);
            })
          );
        }
        return result;
      });
      status_systems = _.uniq(_.flatten(status_systems)).reverse();

      var result  = yield this[`${this.name}`](manifest, systems, opts);

      this.ui.output("");
      yield lazy.Status.status(this, manifest, status_systems);

      if (command_parse_result) {
        this.ui.ok('commands.start.get_project.final_started_message', {
          git_destination_path: command_parse_result.git_destination_path
        });
      }

      return result;
    })
    .catch(function (err) {
      if (err instanceof AzkError) {
        this.ui.fail(err.toString());
      } else {
        this.ui.fail(err.stack);
      }
    }.bind(this));
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

    var options = {
      build_force    : opts.rebuild || false,
      provision_force: (opts.rebuild ? true : opts.reprovision) || false,
      remove         : !opts['no-remove'],
    };

    this.verbose_msg(1, () => {
      options = _.merge(options, {
        provision_verbose: true,
        stdout: this.ui.stdout(),
        stderr: this.ui.stderr(),
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
