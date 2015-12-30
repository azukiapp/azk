import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import Azk from 'azk';

class Version extends CliTrackerController {
  constructor(...args) {
    super(...args);
    this.require_terms = false;
  }

  index() {
    this.ui.output("azk %s", Azk.version);
    return 0;
  }
}

module.exports = Version;
