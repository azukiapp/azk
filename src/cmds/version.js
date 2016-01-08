import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import Azk from 'azk';

export default class Version extends CliTrackerController {
  constructor(...args) {
    super(...args);
    this.require_terms = false;
  }

  index() {
    this.ui.output("azk %s", Azk.version);
    return 0;
  }
}
