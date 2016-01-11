import { _ } from 'azk';
import { TermsController } from 'azk/cli/terms_controller';
import { promiseResolve } from 'azk/utils/promises';
import { default as tracker } from 'azk/utils/tracker';

export class CliTrackerController extends TermsController {
  constructor(...args) {
    super(...args);
    this.ui = this.ui || {};
    this.ui.tracker = tracker;
  }

  // callbacks
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
    return super.before_action_tracker(action_name, params).then(() => {
      var command_opts = _.pick(params, [
        '__doubledash', 'no-daemon', 'reload-vm', 'reprovision', 'rebuild',
        'quiet', 'open', 'verbose', 'to', 'force', 'log', 'color', 'child',
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
