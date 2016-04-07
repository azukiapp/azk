import { _ } from 'azk';

export class Validate {
  static analyze(manifest) {
    var errors = [];

    // validates
    var validations = [ this._have_systems(manifest),
                        this._have_old_http_hostname(manifest),
                        this._have_old_image_definition(manifest),
                        this._validate_wait_option(manifest),
                        this._have_dollar_sign_string_interpotation(manifest)];

    validations.forEach(function(validation) {
      if (validation && validation.length > 0) {
        errors = errors.concat(validation);
      }
    });

    return errors;
  }

  static _have_systems(manifest) {
    if (_.isEmpty(_.keys(manifest.systems))) {
      return [this._warning('no_system_set', manifest)];
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

  static _have_old_image_definition(manifest) {
    return _.reduce(manifest.systems, (errors, system) => {
      if (system.deprecatedImage) {
        return errors.concat(
          this._deprecate((system.image || {}), manifest, system.name, 'image', 'image.provider')
        );
      } else {
        return errors;
      }
    }, []);
  }

  static _have_dollar_sign_string_interpotation(manifest) {
    // https://regex101.com/r/eZ4mQ6/3
    var dollar_check = /((?:[$]{|<%|#{-|#{=)[=|-]?)(.*\..*)(}|%>)/;
    return _.reduce(manifest.systems, (errors, system) => {
      var raw = system.options.raw;
      var check = (value, key) => {
        if (_.isString(value)) {
          let match = value.match(dollar_check);
          if (match) {
            errors.push(
              this._entry('deprecate', 'deprecated_token', manifest, {
                token_open: match[1],
                token_close: match[3],
                original: match[0],
                suggestion: `#{${match[2]}}`,
                option: key,
                value: value,
                system: system.name,
              })
            );
          }
        } else if (_.isArray(value)) {
          _.each(value, (v) => check(v, key));
        } else if (_.isObject(value)) {
          _.each(value, (v, k) => {
            check(k, key);
            check(v, `${key}.${k}`);
          });
        }
      };
      _.each(raw, check);
      return errors;
    }, []);
  }

  static _validate_wait_option(manifest) {
    return _.reduce(manifest.systems, (errors, system) => {

      // ignore if it is not present or equal false
      if (typeof system.options.wait === 'undefined' || system.options.wait === false) {
        return errors;
      }

      // check positive number
      if (_.isNumber(system.options.wait) && system.options.wait <= 0) {
        return errors.concat(
          this._entry('fail', 'invalid_option_value', manifest, {
            option: 'wait',
            value: system.options.wait,
            system_name: system.name,
            docs_url: 'http://docs.azk.io/en/reference/azkfilejs/wait.html',
          })
        );
      }

      // check accepted types
      if (!_.isNumber(system.options.wait) && !_.isObject(system.options.wait)) {
        return errors.concat(
          this._entry('fail', 'invalid_option_type', manifest, {
            option: 'wait',
            value: system.options.wait,
            system_name: system.name,
            docs_url: 'http://docs.azk.io/en/reference/azkfilejs/wait.html',
          })
        );
      }

      // wait object - retry
      if (_.isObject(system.options.wait) && system.options.wait.retry) {
        if (_.isNumber(system.options.wait.retry) && system.options.wait.retry < 0) {
          return errors.concat(
            this._entry('fail', 'invalid_option_value', manifest, {
              option: 'wait.retry',
              value: system.options.wait.retry,
              system_name: system.name,
              docs_url: 'http://docs.azk.io/en/reference/azkfilejs/wait.html',
            })
          );
        }

        if (!_.isNumber(system.options.wait.retry)) {
          return errors.concat(
            this._entry('fail', 'invalid_option_type', manifest, {
              option: 'wait.retry',
              value: system.options.wait.retry,
              system_name: system.name,
              docs_url: 'http://docs.azk.io/en/reference/azkfilejs/wait.html',
            })
          );
        }
      }

      // wait object - timeout
      if (_.isObject(system.options.wait) && system.options.wait.timeout) {
        if (_.isNumber(system.options.wait.timeout) && system.options.wait.timeout < 0) {
          return errors.concat(
            this._entry('fail', 'invalid_option_value', manifest, {
              option: 'wait.timeout',
              value: system.options.wait.timeout,
              system_name: system.name,
              docs_url: 'http://docs.azk.io/en/reference/azkfilejs/wait.html',
            })
          );
        }

        if (!_.isNumber(system.options.wait.timeout)) {
          return errors.concat(
            this._entry('fail', 'invalid_option_type', manifest, {
              option: 'wait.timeout',
              value: system.options.wait.timeout,
              system_name: system.name,
              docs_url: 'http://docs.azk.io/en/reference/azkfilejs/wait.html',
            })
          );
        }
      }

      if (_.isObject(system.options.wait)) {
        return errors.concat(
          this._deprecate((system.image || {}), manifest, system.name, 'wait', 'wait')
        );
      }

      return errors;
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
