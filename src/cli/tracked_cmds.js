import { _ } from 'azk';
import { promiseResolve } from 'azk/utils/promises';
import { default as tracker } from 'azk/utils/tracker';
import { Command } from 'azk/cli/command';
import { Helpers } from 'azk/cli/command';

export class TrackedCmds extends Command {

  constructor(...args) {
    super(...args);
    this.tracker = tracker;
  }

  before_action(opts, ...args) {
    return this.before_action_tracker(opts, ...args).then(() => {
      return super.before_action(opts, ...args);
    });
  }

  after_action(...args) {
    return this.sendTrackerData().then(() => {
      return super.after_action(...args);
    });
  }

  before_action_tracker(opts) {
    return Helpers.askPermissionToTrack(this).then((shouldTrack) => {
      if (!shouldTrack) {
        return false;
      }

      this.trackerEvent = this.tracker.newEvent('command', {
        event_type: this.name,
        command_opts: _.pick(opts, [
          'verbose',
          'quiet',
          'remove',
          'action',
          'reprovision',
          'rebuild']),
      });

      return true;
    });
  }

  sendTrackerData() {
    if (this.trackerEvent) {
      return this.trackerEvent.send();
    } else {
      return promiseResolve(false);
    }
  }
}
