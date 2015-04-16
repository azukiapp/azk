import { async } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      if (opts.action.match(/track-/)) {
        var status = this.tracker.loadTrackerPermission();
        this.ok('commands.config.tracking-' + status);

        if (opts.action == "track-toggle") {
          this.tracker.saveTrackerPermission(undefined);
          yield Helpers.askPermissionToTrack(this);
        }
      }
    });
  }
}

export function init(cli) {
  (new Cmd('config {action}', cli))
    .setOptions('action', { options: ['track-toggle', 'track-status'] });
}
