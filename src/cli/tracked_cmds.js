import { _, async } from 'azk';
import { default as tracker } from 'azk/utils/tracker';
import { Command } from 'azk/cli/command';

export class TrackedCmds extends Command {

  constructor(...args) {
    super(...args);
    this._command_tracked = false;
    this.tracker = tracker;
  }

  addTrackData(key, data) {
    var obj = {};
    obj[key] = data;
    this.tracker.addData(obj);
  }

  before_action(opts, ...args) {
    return this.before_action_tracker(opts, ...args)
    .then(function () {
      return super(opts, ...args);
    })
    .catch(function (err) {
      this.tracker.logAnalyticsError(err);
      return super(opts, ...args);
    });
  }

  after_action(action_result, opts, ...args) {
    return this.after_action_tracker(action_result, opts, ...args)
    .then(function () {
      return super(action_result, opts, ...args);
    })
    .catch(function (err) {
      this.tracker.logAnalyticsError(err);
      return super(action_result, opts, ...args);
    });
  }

  before_action_tracker(opts, ...args) {
    return async(this, function* () {
      var shouldTrack = this.tracker.askPermissionToTrack(this);
      if (!shouldTrack) {
        return super(opts, ...args);  // do not track
      }

      this.tracker.addData({
        event_type: this.name,
        command_opts: _.pick(opts, [
          'verbose',
          'quiet',
          'remove',
          'reprovision',
          'rebuild']),
      });
    });
  }

  after_action_tracker(action_result, opts, ...args) {
    return async(this, function* () {
      if (this._command_tracked) { return true; }
      this._command_tracked = true;

      // check if user accepted to be tracked
      var shouldTrack = yield this.tracker.askPermissionToTrack(this);

      if (!shouldTrack) {
        // exit
        return super(action_result, args, opts); // do not track
      }

      // IGNORES first agent start event with daemon
      var starting_daemon_event_to_ignore = opts.daemon && opts.action === 'start';
      if (starting_daemon_event_to_ignore) {
        return super(action_result, args, opts);
      }

      // track
      yield this.tracker.track('command', this.tracker.data);
    });
  }
}
