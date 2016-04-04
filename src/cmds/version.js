import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { config, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';
import { deviceInfo } from 'azk/utils';
import { VersionView } from 'azk/cli/views/version_view';
import Azk from 'azk';

var lazy = lazy_require({
  Client : ['azk/agent/client'],
  VM     : ['azk/agent/vm'],
  osName : 'os-name',
  docker : ['azk/docker', 'default'],
});

export default class Version extends CliTrackerController {
  constructor(...args) {
    super(...args);
    this.require_terms = false;
  }

  // get version, commit id and commit date to create output
  index() {
    var options = this.normalized_params.options;
    return (options.full) ? this.full(options) : this.short();
  }

  short() {
    return Azk.fullVersion().then((version) => {
      this.ui.output(version);
      return 0;
    });
  }

  full(opts) {
    return async(this, function* () {
      // Get agent status
      var agent = yield lazy.Client.status();
      var require_vm = config("agent:requires_vm");

      // Load configs from agent
      if (agent.agent) {
        yield Helpers.requireAgent(this.ui);
      }

      // Mount data to render
      let device = deviceInfo();
      let data = {
        os     : `${device.os} - [${device.proc_arch}], memory: ${device.total_memory}MB`,
        version: yield Azk.fullVersion(),
        docker : require_vm && !agent.agent ? { Version: this.ui.c.red("down") } : yield lazy.docker.version(),
        use_vm : require_vm ? this.ui.c.green("yes") : this.ui.c.yellow("no"),
        agent_running: agent.agent ? this.ui.c.green("up") : this.ui.c.red("down"),
        vbox_version : require_vm ? yield lazy.VM.version() : this.ui.c.red('not applicable'),
      };

      if (require_vm && agent.agent) {
        var ip = config('agent:vm:ip');
        data.use_vm = data.use_vm + ', ip: ' + this.ui.c.yellow(ip);
      }

      // Show doctor info
      (new VersionView(this.ui)).render(data, opts.logo);

      return 0;
    });
  }
}
