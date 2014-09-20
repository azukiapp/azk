"use strict";
var __moduleName = "src/manifest/validate";
var _ = require('azk')._;
var Validate = function Validate() {};
($traceurRuntime.createClass)(Validate, {}, {
  analyze: function(manifest) {
    var errors = [];
    errors = errors.concat(this._have_systems(manifest), this._have_old_volumes(manifest));
    return errors;
    ;
  },
  _have_systems: function(manifest) {
    if (_.isEmpty(_.keys(manifest.systems))) {
      return [this._warning('not_systems', manifest)];
    }
    return [];
  },
  _have_old_volumes: function(manifest) {
    var $__0 = this;
    return _.reduce(manifest.systems, (function(errors, system) {
      if (!_.isEmpty(system.options.mount_folders) || !_.isEmpty(system.options.persistent_folders)) {
        errors.push($__0._deprecate("old_volumes", manifest, {system: system.name}));
      }
      return errors;
    }), []);
  },
  _deprecate: function() {
    var $__6;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return ($__6 = this)._entry.apply($__6, $traceurRuntime.spread(['deprecate'], args));
  },
  _warning: function() {
    var $__6;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return ($__6 = this)._entry.apply($__6, $traceurRuntime.spread(['warning'], args));
  },
  _error: function() {
    var $__6;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    return ($__6 = this)._entry.apply($__6, $traceurRuntime.spread(['error'], args));
  },
  _entry: function(level, key, manifest) {
    var data = arguments[3] !== (void 0) ? arguments[3] : {};
    return _.merge(data, {
      level: level,
      key: key,
      manifest: manifest
    });
  }
});
module.exports = {
  get Validate() {
    return Validate;
  },
  __esModule: true
};
//# sourceMappingURL=validate.js.map