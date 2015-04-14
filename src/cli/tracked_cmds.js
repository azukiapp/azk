import { log, _, async } from 'azk';
import { Tracker } from 'azk/utils/tracker';
import { Command } from 'azk/cli/command';

export class TrackedCmds extends Command {

  addTrackData(key, data) {
    var obj = {};
    obj[key] = data;
    this.tracker.addData(obj);
  }

  before_action(opts, ...args) {
    // TRACKER
    this.tracker = new Tracker();

    // generate command id
    var new_command_id = this.tracker.generateRandomId();

    this.tracker.addData({
      event_type: this.name,
      command_opts: _.pick(opts, [
        'verbose',
        'quiet',
        'remove',
        'reprovision',
        'rebuild']),
    });

    this.tracker.meta_info = {
      agent_session_id: this.tracker.loadAgentSessionId(),
      command_id      : new_command_id
    };

    return super(opts, ...args);
  }

  after_action(action_result, args, opts) {
    return async(this, function* () {
      // track
      var tracker_result = yield this.tracker.track(this.name, this.tracker.data);

      if (tracker_result !== 0) {
        log.debug('ERROR tracker_result:', tracker_result);
      }

      return super(action_result, args, opts);
    });
  }
}
