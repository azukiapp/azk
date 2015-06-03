import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import Azk from 'azk';

class Version extends CliTrackerController {
  index() {
    this.ui.output("azk %s", Azk.version);
    return 0;
  }
}

module.exports = Version;
