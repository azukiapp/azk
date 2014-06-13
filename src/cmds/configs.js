import { _, config } from 'azk';
import { Command } from 'azk/cli/command';

class Cmd extends Command {
  action(opts) {
    var configs = {
      docker_url: config('docker:host'),
      vm_ip: config('agent:vm:ip'),
    }

    _.each(configs, (value, key) => {
      this.output(`${key}: ${value}`);
    });
  }
}

export function init(cli) {
  (new Cmd('configs [path]', cli))
}

