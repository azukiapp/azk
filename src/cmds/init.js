import { CliController } from 'cli-router';
import { _, config, fsAsync, path, lazy_require, log } from 'azk';
import { async, promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  Generator: ['azk/generator'],
  example_system: ['azk/generator'],
});

class Init extends CliController {
  index(params) {
    return async(this, function* () {
      if (params.filename) {
        return this.showFilename();
      }

      var generator = new lazy.Generator(this.ui);
      var manifest  = config("manifest");
      var cwd  = params.path || this.cwd;
      var file = path.join(cwd, manifest);

      var manifest_exists = yield fsAsync.exists(file);
      if (manifest_exists && !params.force) {
        this.ui.fail(this.ui.tKeyPath(this.name, "already_exists"), manifest);
        return promiseResolve(1);
      }

      var systemsData = yield generator.findSystems(cwd);
      log.debug('generator.findSystems(\'%s\')', cwd);

      if (_.isEmpty(systemsData)) {
        this.ui.fail(this.ui.tKeyPath(this.name, "not_found"));
        systemsData = { [lazy.example_system.name]: lazy.example_system };
      }

      yield generator.render({ systems: systemsData }, file);
      this.ui.ok(this.ui.tKeyPath(this.name, 'generated'), manifest);

      // Only show tips if is a git dir
      var has_git_dir = yield fsAsync.exists(path.join(cwd, ".git"));
      if (has_git_dir) {
        this.ui.ok(this.ui.tKeyPath(this.name, 'github'));
      }

      return promiseResolve(0);
    });
  }

  showFilename() {
    this.ui.output(config('manifest'));
  }
}

module.exports = Init;
