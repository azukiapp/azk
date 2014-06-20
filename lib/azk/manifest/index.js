"use strict";
var __moduleName = "src/manifest/index";
var parent = require('parentpath').sync;
var $__6 = require('azk'),
    path = $__6.path,
    fs = $__6.fs,
    config = $__6.config,
    _ = $__6._,
    t = $__6.t;
var $__6 = require('vm'),
    runInNewContext = $__6.runInNewContext,
    createScript = $__6.createScript;
var System = require('azk/manifest/system').System;
var createCache = require('fscache').createSync;
var mkdir = require('mkdirp').sync;
var $__6 = require('azk/utils/errors'),
    ManifestError = $__6.ManifestError,
    ManifestRequiredError = $__6.ManifestRequiredError,
    SystemNotFoundError = $__6.SystemNotFoundError;
var Utils = require('azk/utils').default;
var file_name = config('manifest');
var check = require('syntax-error');
var tsort = require('gaia-tsort');
var ManifestDsl = {
  require: require,
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
};
($traceurRuntime.createClass)(Meta, {
  set cache(value) {
    this.__cache = value;
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
  var $__6;
  var file = arguments[1] !== (void 0) ? arguments[1] : null;
  var required = arguments[2] !== (void 0) ? arguments[2] : false;
  if (typeof file == "boolean")
    ($__6 = [file, null], required = $__6[0], file = $__6[1], $__6);
  if (required && !cwd)
    throw new Error("Manifest class require a project path");
  this.images = {};
  this.systems = {};
  this.bins = {};
  this.default = null;
  this.file = file || $Manifest.find_manifest(cwd);
  if (required && !this.exist)
    throw new ManifestRequiredError(cwd);
  this.meta = new Meta(this);
};
var $Manifest = Manifest;
($traceurRuntime.createClass)(Manifest, {
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
    this.systemOrder();
  },
  addSystem: function(name, data) {
    if (!(data instanceof System)) {
      if (_.isEmpty(data.image)) {
        var msg = t("manifest.image_required", {system: name});
        throw new ManifestError(this.file, msg);
      }
      var image = data.image;
      delete data.image;
      data = new System(this, name, image, data);
    }
    this.systems[name] = data;
    if (!this.default)
      this.default = name;
    return this;
  },
  system: function(name) {
    var isRequired = arguments[1] !== (void 0) ? arguments[1] : false;
    var sys = this.systems[name];
    if (isRequired && !sys)
      throw new SystemNotFoundError(this.file, name);
    return sys;
  },
  setMeta: function() {
    var $__7;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    ($__7 = this.meta).set.apply($__7, $traceurRuntime.toObject(args));
    return this;
  },
  systemOrder: function() {
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
    return result.path.slice(1);
  },
  getMeta: function() {
    var $__7;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    return ($__7 = this.meta).getOrSet.apply($__7, $traceurRuntime.toObject(args));
  },
  get systemDefault() {
    return this.system(this.default);
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
      context[name] = func.bind(target);
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
    return manifest.addSystem("__tmp__", {
      image: image,
      workdir: "/azk/<%= manifest.dir %>",
      mount_folders: {".": "/azk/<%= manifest.dir %>"}
    });
  }
});
var Fake = function Fake() {
  for (var args = [],
      $__5 = 0; $__5 < arguments.length; $__5++)
    args[$__5] = arguments[$__5];
  $traceurRuntime.superCall(this, $Fake.prototype, "constructor", $traceurRuntime.spread(args));
  this.meta.cache = {
    values: {},
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