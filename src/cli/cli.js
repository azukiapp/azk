import { _, lazy_require } from 'azk';
import { isPromise } from 'azk/utils/promises';
import { Command, Option } from 'azk/cli/command';
import { InvalidValueError } from 'azk/utils/errors';

var path = require('path');
var lazy = lazy_require({
  glob: ['glob', 'sync'],
});

export { Command };
export class Cli extends Command {
  constructor(name, user_interface, cmds_cwd) {
    super(name, user_interface, cmds_cwd);

    // Load sub-commands
    if (cmds_cwd) {
      this.__load_cmds(cmds_cwd);
    }
  }

  initChildren(children) {
    this.addCmd(children);
  }

  __load_cmds(cwd) {
    var cmds = lazy.glob("*.js", { cwd: cwd });
    _.each(cmds, (cmd) => {
      require(path.join(cwd, cmd)).init(this);
    });
  }

  // External options
  addCmd(cmd) {
    var opt = _.find(this.stackable, (opt) => { return opt.name == 'command'; });
    if (!opt) {
      opt = new Option({
        name: 'command', type: String, require: true, options: [], stop: true
      });
      this.stackable.push(opt);
    }
    opt.options.push(cmd);
    this.commands[cmd.name] = cmd;
  }

  showUsage(command = null) {
    if (!command) {
      return super.showUsage();
    }

    var cmd = this.commands[command];
    if (!cmd) {
      throw new InvalidValueError('command', command);
    }

    // Show usage for command
    var prefix = this.usageLine("command");
    return cmd.showUsage(prefix);
  }

  stopCpuProfiling() {
    if (!process.env.AZK_ENABLE_CHROME_CPU_PROFILER) {
      return;
    }
    var profiler = require('chrome-cpu-profiler');
    if (!profiler.profilerRun) {
      var data = profiler.stopProfiling('cpu-azk-profile');
      profiler.writeFile(data);
      profiler.profilerRun = true;
    }
  }

  stopNjsTracer() {
    if (process.env.AZK_ENABLE_NJS_TRACE_PROFILER) {
      global.njstrace.save('trace_result.json');
    }
  }

  action(opts) {
    var cmd = this.commands[opts.command];
    if (cmd && cmd instanceof Command) {
      // run command
      var command_result = cmd.run(_.clone(opts.__leftover), opts);
      if (isPromise(command_result)) {
        return command_result.then((result) => {
          this.stopCpuProfiling();
          this.stopNjsTracer();
          return result;
        });
      } else {
        this.stopCpuProfiling();
        this.stopNjsTracer();
        return command_result;
      }
    }
  }

}
