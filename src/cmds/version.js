import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import Azk from 'azk';
import { config } from 'azk';

export default class Version extends CliTrackerController {
  constructor(...args) {
    super(...args);
    this.require_terms = false;
  }

  index() {
    const azk_last_commit = config('azk_last_commit');
    return Azk.gitCommitIdAsync(azk_last_commit)
    .then((commitId) => {
      this.ui.output(`azk version ${Azk.version}, build ${commitId}`);
      return 0;
    });
  }
}
