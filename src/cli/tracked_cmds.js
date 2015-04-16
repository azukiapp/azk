import { _, Q } from 'azk';
import { default as tracker } from 'azk/utils/tracker';
import { Command } from 'azk/cli/command';
import { Helpers } from 'azk/cli/command';

export class TrackedCmds extends Command {

  constructor(...args) {
    super(...args);
    this._command_tracked = false;
    this.tracker = tracker;
  }

  before_action(opts, ...args) {
    return this.before_action_tracker(opts, ...args).then(() => {
      return super(opts, ...args);
    });
  }

  after_action(...args) {
    return this.sendTrackerData().then(() => {
      return super(...args);
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
      if (this._command_tracked) { return Q(true); }
      this._command_tracked = true;

      // track
      return this.trackerEvent.send();
    } else {
      return Q(false);
    }
  }
}
