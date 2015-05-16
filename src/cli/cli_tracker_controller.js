import { CliController } from 'cli-router';
import { Helpers } from 'azk/cli/helpers';
import { _ } from 'azk';
import { promiseResolve } from 'azk/utils/promises';
import { default as tracker } from 'azk/utils/tracker';

export class CliTrackerController extends CliController {
  constructor(...args) {
    super(...args);
    this.ui = this.ui || {};
    this.ui.tracker = tracker;
  }

  before_action(...args) {
    return this.before_action_tracker(...args).then(() => {
      return super.before_action(...args);
    });
  }

  after_action(...args) {
    return this.sendTrackerData().then(() => {
      return super.after_action(...args);
    });
  }

  before_action_tracker(action_name, params) {
    return Helpers
      .askPermissionToTrack(this.ui)
      .then((shouldTrack) => {
        if (!shouldTrack) {
          return false;
        }

        var command_opts = _.pick(params, [
          '__doubledash', 'no-daemon', 'reload-vm', 'reprovision', 'rebuild',
          'quiet', 'open', 'verbose', 'to', 'force', 'log', 'colored', 'child',
        ]);

        command_opts.action = action_name;

        this.trackerEvent = this.ui.tracker.newEvent('command', {
          event_type: this.name,
          command_opts
        });

        return true;
      });
  }

  sendTrackerData() {
    if (this.trackerEvent) {
      return this.trackerEvent.send();
    } else {
      return promiseResolve(0);
    }
  }
}
