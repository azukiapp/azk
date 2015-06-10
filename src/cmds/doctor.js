import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { config, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';
import Azk from 'azk';

var lazy = lazy_require({
  Client: ['azk/agent/client'],
});

class Doctor extends CliTrackerController {
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
        docker: require_vm && !agent.agent ? { Version: "down".red } : yield this.docker.version(),
        use_vm: require_vm ? "yes".green : "no".yellow,
        agent_running: agent.agent ? "up".green : "down".red,
      };

      if (require_vm && agent.agent) {
        var ip = config('agent:vm:ip');
        data.use_vm = data.use_vm + ', ip: ' + ip.yellow;
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
               ${"##########".blue}
           ${"##################".blue}
         ${"######################".blue}
        ${"########################".blue}      ${data_string[1]}
       ${"#################  #######".blue}     ${data_string[2]}
      ${"##################  ########".blue}    ${data_string[3]}
     ${"####     ##       #  ###  ####".blue}   ${data_string[4]}
     ${"########  ####   ##  #  ######".blue}
     ${"###  ###  ##   ####  ##  #####".blue}
      ${"##    #  #       #  ###  ###".blue}
       ${"##########################".blue}
        ${"########################".blue}
         ${"######################".blue}
            ${"################".blue}
               ${"##########".blue}
    `;

    return azk_logo;
  }

  render_normal(data) {
    var result = `
      ${"Version".cyan} : ${data.version.blue}
      ${"Agent".cyan}   : ${data.agent_running}
      ${"Docker".cyan}  : ${data.docker.Version}
      ${"Use vm".cyan}  : ${data.use_vm}
    `;
    return result;
  }
}

module.exports = Doctor;
