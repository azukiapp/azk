import { CliController } from 'cli-router';
import { _, config, fs, path, lazy_require, log } from 'azk';

var lazy = lazy_require({
  Generator: ['azk/generator'],
  example_system: ['azk/generator'],
});

class Init extends CliController {
  index(params) {
    if (params.filename) {
      return this.showFilename();
    }

    var generator = new lazy.Generator(this.ui);
    var manifest  = config("manifest");
    var cwd  = params.path || this.cwd;
    var file = path.join(cwd, manifest);

    if (fs.existsSync(file) && !params.force) {
      this.ui.fail(this.ui.tKeyPath(this.name, "already_exists"), manifest);
      return 1;
    }

    var systemsData = generator.findSystems(cwd);
    log.debug('generator.findSystems(\'%s\')', cwd);

    if (_.isEmpty(systemsData)) {
      this.ui.fail(this.ui.tKeyPath(this.name, "not_found"));
      systemsData = { [lazy.example_system.name]: lazy.example_system };
    }

    generator.render({ systems: systemsData }, file);
    this.ui.ok(this.ui.tKeyPath(this.name, 'generated'), manifest);

    // Only show tips if is a git dir
    if (fs.existsSync(path.join(cwd, ".git"))) {
      this.ui.tOutput(this.ui.tKeyPath(this.name, 'github'));
    }

    return 0;
  }

  showFilename() {
    this.output(config('manifest'));
  }
}

module.exports = Init;
