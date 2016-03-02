import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import Azk from 'azk';
import { config } from 'azk';

export default class Version extends CliTrackerController {
  constructor(...args) {
    super(...args);
    this.require_terms = false;
  }

  // get version, commit id and commit date to create output
  index() {
    let versionOutput = `azk version ${Azk.version}, build `;
    const azk_last_commit_id = config('azk_last_commit_id');
    return Azk.commitId(azk_last_commit_id)
    .then((commitId) => {
      versionOutput = versionOutput + commitId + ', date ';
      const azk_last_commit_date = config('azk_last_commit_date');
      return Azk.commitDate(azk_last_commit_date);
    })
    .then((commitDate) => {
      versionOutput = versionOutput + commitDate;
      this.ui.output(versionOutput);
      return 0;
    });
  }
}
