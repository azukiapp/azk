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

    var command_name = this.name;
    // if command and sub command
    if (args[0].__leftover && args[0].__leftover.length > 0) {
      command_name = command_name + ' ' + args[0].__leftover.join(' ');
    }

    // AGENT START and agent startchild
    var startchild_daemon = opts.daemon && opts.action === 'startchild';
    var starting_no_daemon = !opts.daemon && opts.action === 'start';

    // /**/console.log('\n>>---------\n starting_daemon:\n', startchild_daemon, '\n>>---------\n');/*-debug-*/
    // /**/console.log('\n>>---------\n starting_no_daemon:\n', starting_no_daemon, '\n>>---------\n');/*-debug-*/

    if (startchild_daemon || starting_no_daemon) {
      // generate session id and merges meta info
      this.tracker.meta_info = {
        agent_session_id: this.tracker.saveAgentSessionId()
      };
    }

    // rescue session id
    this.tracker.meta_info = {
      agent_session_id: this.tracker.loadAgentSessionId(),
      command_id      : new_command_id
    };

    this.tracker.addData({
      event_type: command_name,
      command_opts: _.pick(opts, [
        'verbose',
        'quiet',
        'remove',
        'reprovision',
        'rebuild']),
    });

    return super(opts, ...args);
  }

  after_action(action_result, opts, ...args) {
    return async(this, function* () {

      // IGNORES first agent start event with daemon
      var starting_daemon_event_to_ignore = opts.daemon && opts.action === 'start';
      if (starting_daemon_event_to_ignore) {
        return super(action_result, args, opts);
      }

      // track
      var tracker_result = yield this.tracker.track('command', this.tracker.data);

      if (tracker_result !== 0) {
        log.error('ERROR tracker_result:', tracker_result);
      }

      return super(action_result, args, opts);
    });
  }
}
