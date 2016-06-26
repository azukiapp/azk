import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { config, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';
import { deviceInfo } from 'azk/utils';
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

      let docker_version = null;

      // Load configs from agent
      if (agent.agent) {
        yield Helpers.requireAgent(this.ui);
        docker_version = yield lazy.docker.version();
      }

      // Mount data to render
      let device = deviceInfo();

      if (device.os.match(/^Linux\ /) && !docker_version) {
        docker_version = yield this._getDockerVersionByCli();
      }

      let data = {
        os     : `${device.os} (${device.proc_arch}), Memory: ${device.total_memory}MB`,
        version: yield Azk.fullVersion(),
        docker : docker_version || { Version: "Down" },
        use_vm : require_vm ? "Yes" : "No",
        agent_running: agent.agent ? "Running" : "Stopped",
        vbox_version : require_vm ? yield lazy.VM.version() : "N/A",
      };

      if (require_vm && agent.agent) {
        let ip = config('agent:vm:ip');
        data.use_vm = `${data.use_vm}, IP: ${ip}`;
      }

      // Show doctor info
      this.view('version').render(data, opts.logo);

      return 0;
    });
  }

  _getDockerVersionByCli() {
    let cmd   = 'docker --version';
    let regex = /^Docker\ version\ (\d+.\d+.\d+)/;

    return this.ui.execSh(cmd, true).then((result) => {
      if (!result.stdout) {
        return null;
      }
      let match = result.stdout.match(regex);
      return match ? { Version: `${match[1]} (CLI)` } : null;
    });
  }
}
