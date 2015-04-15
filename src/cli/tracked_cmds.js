import { _, async } from 'azk';
import { Tracker } from 'azk/utils/tracker';
import { Command } from 'azk/cli/command';

export class TrackedCmds extends Command {

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
      Tracker.logAnalyticsError(err);
      return super(opts, ...args);
    });
  }

  after_action(action_result, opts, ...args) {
    return this.after_action_tracker(action_result, opts, ...args)
    .then(function () {
      return super(action_result, opts, ...args);
    })
    .catch(function (err) {
      Tracker.logAnalyticsError(err);
      return super(action_result, opts, ...args);
    });
  }

  before_action_tracker(opts, ...args) {
    return async(this, function* () {
      var shouldTrack = yield Tracker.askPermissionToTrack(this);
      if (!shouldTrack) {
        return super(opts, ...args);  // do not track
      }

      // TRACKER
      this.tracker = new Tracker();
      yield this.tracker.loadMetadata();

      // generate command id
      yield this.tracker.saveCommandId();

      var command_name = this.name;
      // if command is 'agent' then get sub-command
      var should_get_agent_action = args[0].__leftover &&
         args[0].__leftover.length > 0 &&
         command_name === 'agent';

      if (should_get_agent_action) {
        command_name = command_name + ' ' + args[0].__leftover[0];
      }
      // create agent_session_id - > agent start or agent startchild
      var startchild_daemon = opts.daemon && opts.action === 'startchild';
      var starting_no_daemon = !opts.daemon && opts.action === 'start';
      if (startchild_daemon || starting_no_daemon) {
        // generate session id and merges meta info
        this.tracker.meta_info = {
          agent_session_id: yield this.tracker.saveAgentSessionId()
        };
      }
      this.tracker.addData({
        event_type: command_name,
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
      // an error ocurred on before_action and there is no this.tracker
      var no_tracker_created = typeof this.tracker === 'undefined';

      // check if user accepted to be tracked
      var shouldTrack = yield Tracker.askPermissionToTrack(this);

      if (!shouldTrack || no_tracker_created) {
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
