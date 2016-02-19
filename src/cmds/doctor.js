import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { config, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';
import Azk from 'azk';

var lazy = lazy_require({
  Client: ['azk/agent/client'],
});

export default class Doctor extends CliTrackerController {
  get docker() {
    return require('azk/docker').default;
  }

  index(opts) {
    return async(this, function* () {
      // Get agent status
      var agent = yield lazy.Client.status();
      var require_vm = config("agent:requires_vm");

      // Load configs from agent
      if (agent.agent) {
        yield Helpers.requireAgent(this.ui);
      }

      // Mount data to render
      var data = {
        version: Azk.version,
        docker: require_vm && !agent.agent ? { Version: this.ui.c.red("down") } : yield this.docker.version(),
        use_vm: require_vm ? this.ui.c.green("yes") : this.ui.c.yellow("no"),
        agent_running: agent.agent ? this.ui.c.green("up") : this.ui.c.red("down"),
      };

      if (require_vm && agent.agent) {
        var ip = config('agent:vm:ip');
        data.use_vm = data.use_vm + ', ip: ' + this.ui.c.yellow(ip);
      }

      var render = opts.logo ? this.render_with_logo : this.render_normal;
      this.ui.output(render.apply(this, [data]));
      return 0;
    });
  }

  render_with_logo(data) {
    var data_string = this.render_normal(data);
    data_string = data_string.split("\n");

    var azk_logo = `
               ${this.ui.c.blue("##########")}
           ${this.ui.c.blue("##################")}
         ${this.ui.c.blue("######################")}
        ${this.ui.c.blue("########################")}      ${data_string[1]}
       ${this.ui.c.blue("#################  #######")}     ${data_string[2]}
      ${this.ui.c.blue("##################  ########")}    ${data_string[3]}
     ${this.ui.c.blue("####     ##       #  ###  ####")}   ${data_string[4]}
     ${this.ui.c.blue("########  ####   ##  #  ######")}
     ${this.ui.c.blue("###  ###  ##   ####  ##  #####")}
      ${this.ui.c.blue("##    #  #       #  ###  ###")}
       ${this.ui.c.blue("##########################")}
        ${this.ui.c.blue("########################")}
         ${this.ui.c.blue("######################")}
            ${this.ui.c.blue("################")}
               ${this.ui.c.blue("##########")}
    `;

    return azk_logo;
  }

  render_normal(data) {
    var result = `
      ${this.ui.c.cyan("Version")} : ${this.ui.c.blue(data.version)}
      ${this.ui.c.cyan("Agent")}   : ${data.agent_running}
      ${this.ui.c.cyan("Docker")}  : ${data.docker.Version}
      ${this.ui.c.cyan("Use vm")}  : ${data.use_vm}
    `;
    return result;
  }
}
