import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { promiseResolve } from 'azk/utils/promises';
import { Helpers } from 'azk/cli/helpers';

class Config extends CliTrackerController {
  trackStatus() {
    var status = this.ui.tracker.loadTrackerPermission();
    this.ui.ok('commands.config.tracking-' + status);
    return promiseResolve(0);
  }

  trackToggle(...args) {
    this.trackStatus(...args);
    return Helpers.askPermissionToTrack(this.ui, true);
  }
}

module.exports = Config;
