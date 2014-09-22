"use strict";
var __moduleName = "src/manifest/index";
var parent = require('parentpath').sync;
var $__8 = require('azk'),
    path = $__8.path,
    fs = $__8.fs,
    config = $__8.config,
    _ = $__8._,
    t = $__8.t;
var $__8 = require('vm'),
    runInNewContext = $__8.runInNewContext,
    createScript = $__8.createScript;
var System = require('azk/system').System;
var createCache = require('fscache').createSync;
var mkdir = require('mkdirp').sync;
var Validate = require('azk/manifest/validate').Validate;
var $__8 = require('azk/utils/errors'),
    ManifestError = $__8.ManifestError,
    ManifestRequiredError = $__8.ManifestRequiredError,
    SystemNotFoundError = $__8.SystemNotFoundError;
var Utils = require('azk/utils').default;
var file_name = config('manifest');
var check = require('syntax-error');
var tsort = require('gaia-tsort');
var ManifestDsl = {
  console: console,
  require: require,
  env: process.env,
  disable: null,
  path: function(folder) {
    return {
      type: 'path',
      value: folder
    };
  },
  persistent: function(name) {
    return {
      type: 'persistent',
      value: name
    };
  },
  system: function(name, data) {
    this.addSystem(name, data);
  },
  systems: function(systems) {
    var $__0 = this;
    _.each(systems, (function(system, name) {
      $__0.addSystem(name, system);
    }));
  },
  addImage: function(name, image) {
    this.images[name] = image;
  },
  registerBin: function(name) {
    for (var args = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
    this.bins[name] = $traceurRuntime.spread(args);
  },
  setDefault: function(name) {
    this.default = name;
  }
};
var Meta = function Meta(manifest) {
  var cache = arguments[1] !== (void 0) ? arguments[1] : null;
  this.manifest = manifest;
  this.cache = cache;
};
($traceurRuntime.createClass)(Meta, {
  set cache(value) {
    this.__cache = value;
  },
  clean: function() {
    var path = this.manifest.cache_dir;
    if (fs.existsSync(path)) {
      this.__cache = null;
      return fs.removeSync(path);
    }
  },
  get cache() {
    if (!this.__cache) {
      var cache_dir = this.manifest.cache_dir;
      mkdir(cache_dir);
      this.__cache = createCache(cache_dir);
    }
    return this.__cache;
  },
  getOrSet: function(key, defaultValue) {
    var value = this.cache.getSync(key);
    if (!value && defaultValue) {
      value = defaultValue;
      this.set(key, value);
    }
    return value;
  },
  get: function(key, defaultValue) {
    return this.cache.getSync(key) || defaultValue;
  },
  set: function(key, value) {
    this.cache.putSync(key, value);
    return this;
  }
}, {});
var Manifest = function Manifest(cwd) {
  var $__8;
  var file = arguments[1] !== (void 0) ? arguments[1] : null;
  var required = arguments[2] !== (void 0) ? arguments[2] : false;
  if (typeof file == "boolean")
    ($__8 = [file, null], required = $__8[0], file = $__8[1], $__8);
  if (required && !cwd)
    throw new Error("Manifest class require a project path");
  this.images = {};
  this.systems = {};
  this.bins = {};
  this._default = null;
  this.file = file || $Manifest.find_manifest(cwd);
  if (required && !this.exist)
    throw new ManifestRequiredError(cwd);
  this.meta = new Meta(this);
};
var $Manifest = Manifest;
($traceurRuntime.createClass)(Manifest, {
  validate: function() {
    var $__9;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return ($__9 = Validate).analyze.apply($__9, $traceurRuntime.spread([this], args));
  },
  parse: function() {
    var content = fs.readFileSync(this.file);
    var err = check(content, this.file);
    if (err) {
      throw new ManifestError(this.file, err);
    } else {
      try {
        runInNewContext(content, $Manifest.createDslContext(this), this.file);
      } catch (e) {
        if (!(e instanceof ManifestError)) {
          var stack = e.stack.split('\n');
          var msg = stack[0] + "\n" + stack[1];
          e = new ManifestError(this.file, msg);
        }
        throw e;
      }
    }
    this.systemsInOrder();
  },
  addSystem: function(name, data) {
    if (!(data instanceof System)) {
      this._system_validate(name, data);
      var image = data.image;
      delete data.image;
      data = new System(this, name, image, data);
    }
    this.systems[name] = data;
    if (!this._default)
      this._default = name;
    return this;
  },
  _system_validate: function(name, data) {
    if (!name.match(/^[a-zA-Z0-9-]+$/)) {
      var msg = t("manifest.system_name_invalid", {system: name});
      throw new ManifestError(this.file, msg);
    }
    if (_.isEmpty(data.image)) {
      var msg = t("manifest.image_required", {system: name});
      throw new ManifestError(this.file, msg);
    }
    if (!_.isEmpty(data.balancer)) {
      var msg = t("manifest.balancer_depreciation", {system: name});
      throw new ManifestError(this.file, msg);
    }
  },
  system: function(name) {
    var isRequired = arguments[1] !== (void 0) ? arguments[1] : false;
    var sys = this.systems[name];
    if (isRequired && !sys)
      throw new SystemNotFoundError(this.file, name);
    return sys;
  },
  getSystemsByName: function(names) {
    var $__0 = this;
    var systems_name = this.systemsInOrder();
    if (_.isString(names) && !_.isEmpty(names)) {
      names = _.isArray(names) ? names : names.split(',');
      _.each(names, (function(name) {
        return $__0.system(name, true);
      }));
      systems_name = _.intersection(systems_name, names);
    }
    return _.reduce(systems_name, (function(systems, name) {
      systems.push($__0.system(name, true));
      return systems;
    }), []);
  },
  systemsInOrder: function() {
    var requireds = arguments[0] !== (void 0) ? arguments[0] : [];
    var $__0 = this;
    var edges = [];
    _.each(this.systems, (function(system, name) {
      if (_.isEmpty(system.depends)) {
        edges.push(["__", name]);
      } else {
        _.each(system.depends, (function(depend) {
          if ($__0.system(depend)) {
            edges.push([depend, name]);
          } else {
            var msg = t("manifest.depends_not_declared", {
              system: name,
              depend: depend
            });
            throw new ManifestError($__0.file, msg);
          }
        }));
      }
    }));
    var result = tsort(edges);
    if (result.error) {
      var data = result.error.message.match(/^(.*?)\s.*\s(.*)$/);
      var msg = t("manifest.circular_depends", {
        system1: data[1],
        system2: data[2]
      });
      throw new ManifestError(this.file, msg);
    }
    var path = _.isEmpty(requireds) ? result.path : [];
    if (_.isEmpty(path)) {
      requireds = _.isArray(requireds) ? requireds : [requireds];
      path = _.reduce(requireds, (function(path, node) {
        return $__0.__putNodesInPath(result.graph, path, node);
      }), path);
    }
    return path.slice(1);
  },
  __putNodesInPath: function(graph, path, node_id) {
    var $__0 = this;
    var node = _.find(graph, (function(node) {
      return node.id == node_id;
    }));
    if (!_.isEmpty(node)) {
      path = _.reduce(node.parents, (function(path, parent) {
        return $__0.__putNodesInPath(graph, path, parent);
      }), path);
      if (!_.contains(path, node_id)) {
        path.push(node_id);
      }
    } else {
      throw new SystemNotFoundError(this.file, node_id);
    }
    return path;
  },
  getMeta: function() {
    var $__9;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    return ($__9 = this.meta).getOrSet.apply($__9, $traceurRuntime.toObject(args));
  },
  setMeta: function() {
    var $__9;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    ($__9 = this.meta).set.apply($__9, $traceurRuntime.toObject(args));
    return this;
  },
  cleanMeta: function() {
    var $__9;
    for (var args = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      args[$__6] = arguments[$__6];
    return ($__9 = this.meta).clean.apply($__9, $traceurRuntime.toObject(args));
  },
  set default(nameOrSystem) {
    if (nameOrSystem instanceof System) {
      nameOrSystem = nameOrSystem.name;
    }
    if (!(this.systems[nameOrSystem] instanceof System)) {
      var msg = t('manifest.invalid_default', {system: nameOrSystem});
      throw new ManifestError(this.file, msg);
    }
    this._default = nameOrSystem;
  },
  get systemDefault() {
    return this.system(this._default);
  },
  get manifestPath() {
    return this.cwd;
  },
  get manifestDirName() {
    return path.basename(this.manifestPath);
  },
  get file() {
    return this.__file;
  },
  get exist() {
    return fs.existsSync(this.file);
  },
  set file(value) {
    this.cwd = path.dirname(value);
    this.__file = value;
    if (this.exist) {
      this.parse();
    }
  },
  get file_relative() {
    return path.relative(this.manifestPath, this.file);
  },
  get namespace() {
    var def = Utils.calculateHash(this.file).slice(0, 10);
    return this.meta.getOrSet('namespace', def);
  },
  get cache_dir() {
    return path.join(this.cwd, config('azk_dir'), this.file_relative);
  }
}, {
  createDslContext: function(target, source, file) {
    return _.reduce(ManifestDsl, (function(context, func, name) {
      if (_.isFunction(func))
        context[name] = func.bind(target);
      else
        context[name] = func;
      return context;
    }), {});
  },
  find_manifest: function(target) {
    var dir = Utils.cd(target, function() {
      return parent(file_name);
    });
    return dir ? path.join(dir, file_name) : null;
  },
  makeFake: function(cwd, image) {
    var file = path.join(cwd, file_name);
    var manifest = new Fake(null, file);
    return manifest.addSystem("--tmp--", {
      image: image,
      workdir: "/azk/#{manifest.dir}",
      mounts: {"/azk/#{manifest.dir}": "#{manifest.path}"}
    });
  }
});
var Fake = function Fake() {
  for (var args = [],
      $__7 = 0; $__7 < arguments.length; $__7++)
    args[$__7] = arguments[$__7];
  $traceurRuntime.superCall(this, $Fake.prototype, "constructor", $traceurRuntime.spread(args));
  this.meta.cache = {
    values: {},
    clean: function() {
      this.values = {};
    },
    keyCalc: function(key) {
      return Utils.calculateHash(JSON.stringify(key));
    },
    getSync: function(key) {
      return this.values[this.keyCalc(key)];
    },
    putSync: function(key, value) {
      this.values[this.keyCalc(key)] = value;
    }
  };
};
var $Fake = Fake;
($traceurRuntime.createClass)(Fake, {parse: function() {}}, {}, Manifest);
;
module.exports = {
  get Manifest() {
    return Manifest;
  },
  get file_name() {
    return file_name;
  },
  get System() {
    return System;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map