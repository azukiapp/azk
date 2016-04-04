import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { config } from 'azk';

export default class Doctor extends CliTrackerController {
  index() {
    if (config('flags:show_deprecate')) {
      this.ui.deprecate("commands.doctor.deprecated");
    }
    let cmd = ["version", "--full"];
    var options = this.normalized_params.options;
    if (options.log) { cmd.push("--logo"); }
    return this.runShellInternally(cmd);
  }
}
