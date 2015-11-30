import { _ } from 'azk';
import { CliController } from 'azk/cli/cli_controller';
import { Helpers } from 'azk/cli/helpers';
import { promiseResolve, promiseReject } from 'azk/utils/promises';
import { default as tracker } from 'azk/utils/tracker';
import { MustAcceptTermsOfUse } from 'azk/utils/errors';

export class CliTrackerController extends CliController {
  constructor(...args) {
    super(...args);
    this.ui = this.ui || {};
    this.ui.tracker = tracker;
  }

  // callbacks
  before_action(...args) {
    return this._action_tracker(...args).then(() => {
      return super.before_action(...args);
    });
  }

  after_action(...args) {
    return this.sendTrackerData().then(() => {
      return super.after_action(...args);
    });
  }

  _action_tracker(action_name, params) {
    return Helpers
      .askTermsOfUse(this.ui)
      .then((accepted) => {
        if (!accepted) {
          return promiseReject(new MustAcceptTermsOfUse());
        }

        var command_opts = _.pick(params, [
          '__doubledash', 'no-daemon', 'reload-vm', 'reprovision', 'rebuild',
          'quiet', 'open', 'verbose', 'to', 'force', 'log', 'colored', 'child',
        ]);

        if (this.route.actions && this.route.actions.length > 0) {
          var route_first_action = this.route.actions[0];
          if (route_first_action !== 'index') {
            command_opts.action = route_first_action;
          } else {
            command_opts.action = action_name;
          }
        }

        this.trackerEvent = this.ui.tracker.newEvent('command', {
          event_type: this.name,
          command_opts
        });

        return true;
      });
  }

  addDataToTracker(data) {
    if (this.trackerEvent) {
      return this.trackerEvent.addData(data);
    }
  }

  sendTrackerData() {
    if (this.trackerEvent) {
      return this.trackerEvent.send();
    } else {
      return promiseResolve(0);
    }
  }
}
