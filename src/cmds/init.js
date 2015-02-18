import { _, config, fs, path, lazy_require, log } from 'azk';
import { Command } from 'azk/cli/command';

/* global Generator, example_system */
lazy_require(this, {
  Generator() {
    return require('azk/generator').Generator;
  },

  example_system() {
    return require('azk/generator').example_system;
  }
});

class Cmd extends Command {
  action(opts) {
    var manifest = config("manifest");
    var cwd  = opts.path || this.cwd;
    var file = path.join(cwd, manifest);
    var generator = new Generator(this);

    if (fs.existsSync(file) && !opts.force) {
      this.fail(this.tKeyPath("already_exists"), manifest);
      return 1;
    }

    var systemsData = generator.findSystems(cwd);
    log.debug('generator.findSystems(\'%s\')', cwd);

    if (_.isEmpty(systemsData)) {
      this.fail(this.tKeyPath("not_found"));
      systemsData = { [example_system.name]: example_system };
    }

    generator.render({ systems: systemsData }, file);
    this.ok(this.tKeyPath('generated'), manifest);

    // Only show tips if is a git dir
    if (fs.existsSync(path.join(cwd, ".git"))) {
      this.tOutput(this.tKeyPath('github'));
    }

    return 0;
  }
}

export function init(cli) {
  return new Cmd('init [path]', cli)
    .addOption(['--force', '-f'], { default: false });
}
