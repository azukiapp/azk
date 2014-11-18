import { _, async, config, lazy_require } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import Azk from 'azk';

lazy_require(this, {
  Client: ['azk/agent/client'],
});

class Cmd extends Command {
  get docker() {
    return require('azk/docker').default;
  }

  action(opts) {
    return async(this, function* () {
      // Get agent status
      var agent = yield Client.status();
      var require_vm = config("agent:requires_vm");

      // Load configs from agent
      if (agent.agent) {
        yield Helpers.requireAgent();
      }

      // Mount data to render
      var data = {
        version: Azk.version,
        docker: require_vm && !agent.agent ? { Version: "down".red } : yield this.docker.version(),
        use_vm: require_vm ? "yes".green : "no".yellow,
        agent_running: agent.agent ? "up".green : "down".red,
      };

      var render = opts.logo ? this.render_with_logo : this.render_normal;
      this.output(render.apply(this, [data]));
    });
  }

  render_with_logo(data) {
    var data_string = this.render_normal(data);
    data_string = data_string.split("\n");

    return `
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
  }

  render_normal(data) {
    return `
      ${"Azk".cyan}   : ${data.version.blue}
      ${"Agent".cyan} : ${data.agent_running}
      ${"Docker".cyan}: ${data.docker.Version}
      ${"Use vm".cyan}: ${data.use_vm}
    `;
  }
}

export function init(cli) {
  (new Cmd('doctor', cli))
    .addOption(['--logo'], { default: false });
}

