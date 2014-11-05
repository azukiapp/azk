import { _ } from 'azk';

export class Validate {
  static analyze(manifest) {
    var errors = [];

    // validates
    errors = errors.concat(
      this._have_systems(manifest),
      this._have_old_http_hostname(manifest)
    );

    return errors;;
  }

  static _have_systems(manifest) {
    if (_.isEmpty(_.keys(manifest.systems))) {
      return [this._warning('not_systems', manifest)];
    }
    return [];
  }

  static _have_old_http_hostname(manifest) {
    return _.reduce(manifest.systems, (errors, system) => {
      return errors.concat(
        this._deprecate((system.options.http || {}).hostname, manifest, system.name, 'http.hostname', 'http.domains')
      );
    }, []);
  }

  static _deprecate(value, manifest, system, option, new_option) {
    if (!_.isEmpty(value)) {
      return [
        this._entry('deprecate', 'deprecated', manifest, { system, option, new_option })
      ];
    }
    return [];
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
