import { async } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      var status = this.tracker.loadTrackerPermission();
      this.ok('commands.tracking.status.' + status);

      if (opts.action == "toggle") {
        this.tracker.saveTrackerPermission(undefined);
        yield Helpers.askPermissionToTrack(this);
      }
    });
  }
}

export function init(cli) {
  (new Cmd('tracking {action}', cli))
    .setOptions('action', { options: ['toggle', 'status'] });
}
