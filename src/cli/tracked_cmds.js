import { _, Q, async } from 'azk';
import { default as tracker } from 'azk/utils/tracker';
import { Command } from 'azk/cli/command';

export class TrackedCmds extends Command {

  constructor(...args) {
    super(...args);
    this._command_tracked = false;
    this.tracker = tracker;
  }

  before_action(opts, ...args) {
    return this.before_action_tracker(opts, ...args)
    .then(function () {
      return super(opts, ...args);
    })
    .catch(function (err) {
      tracker.logAnalyticsError(err);
      return super(opts, ...args);
    });
  }

  after_action(action_result, ...args) {
    return async(this, function* () {
      try {
        if (Q.isPromise(action_result)) {
          action_result = yield action_result;
        }
        yield this.sendTrackerData();
      } catch (err) {
        this.tracker.logAnalyticsError(err);
      }
      return super(action_result, ...args);
    });
  }

  before_action_tracker(opts, ...args) {
    return async(this, function* () {
      var shouldTrack = yield this.tracker.askPermissionToTrack(this);
      if (!shouldTrack) {
        return super(opts, ...args);  // do not track
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
    });
  }

  sendTrackerData() {
    console.log(process.argv);
    console.log('_command_tracked', this._command_tracked);

    if (this._command_tracked) { return Q(true); }
    this._command_tracked = true;

    // check if user accepted to be tracked
    var shouldTrack = this.tracker.loadTrackerPermission();

    console.log('loadTrackerPermission', shouldTrack);

    if (!shouldTrack) { return Q(false); }

    // track
    return this.trackerEvent.send();
  }
}
