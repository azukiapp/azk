import { _, config, fs, path, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Generator, example_system } from 'azk/generator';

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      var manifest = config("manifest");
      var cwd  = opts.path || this.cwd;
      var file = path.join(cwd, manifest);
      var generator = new Generator(this);

      if (fs.existsSync(file) && !opts.force) {
        this.fail(this.tKeyPath("already"), manifest);
        return 1;
      }

      var systems = generator.findSystems(cwd);
      if (_.isEmpty(systems)) {
        this.fail(this.tKeyPath("not_found"));
        systems = { [example_system.name]: example_system };
      }

      generator.render({ systems }, file);
      this.ok(this.tKeyPath('generated'), manifest);

      // Only show tips if is a git dir
      if (fs.existsSync(path.join(cwd, ".git")))
        this.tOutput(this.tKeyPath('github'));

      return 0;
    });
  }
}

export function init(cli) {
  return new Cmd('init [path]', cli)
    .addOption(['--force', '-f'], { default: false });
}

