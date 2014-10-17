import { _ } from 'azk';

export class Validate {
  static analyze(manifest) {
    var errors = [];

    // validates
    errors = errors.concat(
      this._have_systems(manifest),
      this._have_old_volumes(manifest)
    );

    return errors;;
  }

  static _have_systems(manifest) {
    if (_.isEmpty(_.keys(manifest.systems))) {
      return [this._warning('not_systems', manifest)];
    }
    return [];
  }

  static _have_old_volumes(manifest) {
    return _.reduce(manifest.systems, (errors, system) => {
      if (
        !_.isEmpty(system.options.mount_folders) ||
        !_.isEmpty(system.options.persistent_folders)
      ) {
        errors.push(this._deprecate("old_volumes", manifest, {
          system: system.name,
        }));
      }
      return errors;
    }, []);
  }

  static _deprecate(...args) {
    return this._entry('deprecate', ...args);
  }

  static _warning(...args) {
    return this._entry('warning', ...args);
  }

  static _error(...args) {
    return this._entry('error', ...args);
  }

  static _entry(level, key, manifest, data = {}) {
    return _.merge(data, { level, key, manifest });
  }
}
