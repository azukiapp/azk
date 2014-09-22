import { sync as parent } from 'parentpath';
import { path, fs, config, _, t } from 'azk';
import { runInNewContext, createScript } from 'vm';
import { System } from 'azk/system';
import { createSync as createCache } from 'fscache';
import { sync as mkdir } from 'mkdirp';
import { Validate } from 'azk/manifest/validate';
import { ManifestError, ManifestRequiredError, SystemNotFoundError } from 'azk/utils/errors';
import Utils from 'azk/utils';

var file_name = config('manifest');
var check     = require('syntax-error');
var tsort     = require('gaia-tsort');

var ManifestDsl = {
  console: console,
  require: require,
  env: process.env,
  disable: null,

  // Mounts
  path(folder) {
    return { type: 'path', value: folder }
  },

  persistent(name) {
    return { type: 'persistent', value: name }
  },

  // Systems
  system(name, data) {
    this.addSystem(name, data);
  },

  systems(systems) {
    _.each(systems, (system, name) => {
      this.addSystem(name, system);
    });
  },

  // Extra options
  addImage(name, image) {
    this.images[name] = image;
  },

  registerBin(name, ...args) {
    this.bins[name] = [...args];
  },

  setDefault(name) {
    this.default = name;
  },
}

class Meta {
  constructor(manifest, cache = null) {
    this.manifest = manifest;
    this.cache = cache;
  }

  set cache(value) {
    this.__cache = value;
  }

  clean() {
    var path = this.manifest.cache_dir;
    if (fs.existsSync(path)) {
      this.__cache = null;
      return fs.removeSync(path);
    }
  }

  get cache() {
    if (!this.__cache) {
      var cache_dir = this.manifest.cache_dir;
      mkdir(cache_dir);
      this.__cache = createCache(cache_dir);
    }
    return this.__cache;
  }

  getOrSet(key, defaultValue) {
    var value = this.cache.getSync(key);
    if (!value && defaultValue) {
      value = defaultValue;
      this.set(key, value);
    }
    return value;
  }

  get(key, defaultValue) {
    return this.cache.getSync(key) || defaultValue;
  }

  set(key, value) {
    this.cache.putSync(key, value);
    return this;
  }
}

export class Manifest {
  constructor(cwd, file = null, required = false) {
    if (typeof file == "boolean")
      [required, file] = [file, null];

    if (required && !cwd)
      throw new Error("Manifest class require a project path");

    this.images   = {};
    this.systems  = {};
    this.bins     = {};
    this._default = null;
    this.file     = file || Manifest.find_manifest(cwd);

    if (required && !this.exist)
      throw new ManifestRequiredError(cwd);

    this.meta    = new Meta(this);
  }

  // Validate
  validate(...args) {
    return Validate.analyze(this, ...args);
  }

  parse() {
    var content = fs.readFileSync(this.file);
    var err = check(content, this.file);
    if (err) {
      throw new ManifestError(this.file, err);
    } else {
      try {
        runInNewContext(content, Manifest.createDslContext(this), this.file);
      } catch (e) {
        if (!(e instanceof ManifestError)) {
          var stack = e.stack.split('\n');
          var msg   = stack[0] + "\n" + stack[1];
          e = new ManifestError(this.file, msg);
        }
        throw e;
      }
    }
    this.systemsInOrder();
  }

  static createDslContext(target, source, file) {
    return _.reduce(ManifestDsl, (context, func, name) => {
      if (_.isFunction(func))
        context[name] = func.bind(target);
      else
        context[name] = func;
      return context;
    }, { });
  }

  addSystem(name, data) {
    if (!(data instanceof System)) {
      this._system_validate(name, data);
      var image = data.image;
      delete data.image;
      data = new System(this, name, image, data);
    }

    this.systems[name] = data;
    if (!this._default) this._default = name;

    return this;
  }

  _system_validate(name, data) {
    if (!name.match(/^[a-zA-Z0-9-]+$/)) {
      var msg = t("manifest.system_name_invalid", { system: name });
      throw new ManifestError(this.file, msg);
    }
    if (_.isEmpty(data.image)) {
      var msg = t("manifest.image_required", { system: name });
      throw new ManifestError(this.file, msg);
    }
    if (!_.isEmpty(data.balancer)) {
      var msg = t("manifest.balancer_depreciation", { system: name });
      throw new ManifestError(this.file, msg);
    }
  }

  system(name, isRequired = false) {
    var sys = this.systems[name];

    if (isRequired && !sys)
      throw new SystemNotFoundError(this.file, name);

    return sys;
  }

  getSystemsByName(names) {
    var systems_name = this.systemsInOrder();

    if (_.isString(names) && !_.isEmpty(names)) {
      names = _.isArray(names) ? names : names.split(',');
      _.each(names, (name) => this.system(name, true));
      systems_name = _.intersection(systems_name, names);
    }

    return _.reduce(systems_name, (systems, name) => {
      systems.push(this.system(name, true));
      return systems;
    }, []);
  }

  systemsInOrder(requireds = []) {
    var edges = [];
    _.each(this.systems, (system, name) => {
      if (_.isEmpty(system.depends)) {
        edges.push(["__", name]);
      } else {
        _.each(system.depends, (depend) => {
          if (this.system(depend)) {
            edges.push([depend, name]);
          } else {
            var msg = t("manifest.depends_not_declared", {
              system: name,
              depend: depend,
            })
            throw new ManifestError(this.file, msg);
          }
        });
      }
    });

    var result = tsort(edges);
    if (result.error) {
      var data = result.error.message.match(/^(.*?)\s.*\s(.*)$/);
      var msg  = t("manifest.circular_depends", {
        system1: data[1], system2: data[2]
      });
      throw new ManifestError(this.file, msg);
    }

    var path = _.isEmpty(requireds) ? result.path : [];
    if (_.isEmpty(path)) {
      requireds = _.isArray(requireds) ? requireds : [requireds];
      path = _.reduce(requireds, (path, node) => {
        return this.__putNodesInPath(result.graph, path, node);
      }, path);
    }

    return path.slice(1);
  }

  __putNodesInPath(graph, path, node_id) {
    var node = _.find(graph, (node) => { return node.id == node_id });
    if (!_.isEmpty(node)) {
      path = _.reduce(node.parents, (path, parent) => {
        return this.__putNodesInPath(graph, path, parent);
      }, path);
      if (!_.contains(path, node_id)) {
        path.push(node_id);
      }
    } else {
      throw new SystemNotFoundError(this.file, node_id);
    }
    return path;
  }

  // Meta forwarding
  getMeta(...args) {
    return this.meta.getOrSet(...args);
  }

  setMeta(...args) {
    this.meta.set(...args);
    return this;
  }

  cleanMeta(...args) {
    return this.meta.clean(...args);
  }

  // Default system
  set default(nameOrSystem) {
    if (nameOrSystem instanceof System) {
      nameOrSystem = nameOrSystem.name;
    }

    if (!(this.systems[nameOrSystem] instanceof System)) {
      var msg = t('manifest.invalid_default', { system: nameOrSystem });
      throw new ManifestError(this.file, msg);
    }

    this._default = nameOrSystem;
  }

  get systemDefault() {
    return this.system(this._default);
  }

  // Getters
  get manifestPath() {
    return this.cwd;
  }

  get manifestDirName() {
    return path.basename(this.manifestPath);
  }

  get file() {
    return this.__file;
  }

  get exist() {
    return fs.existsSync(this.file);
  }

  set file(value) {
    this.cwd = path.dirname(value);
    this.__file = value;
    if (this.exist) {
      this.parse();
    }
  }

  get file_relative() {
    return path.relative(this.manifestPath, this.file);
  }

  // TODO: make more fast
  get namespace() {
    var def = Utils.calculateHash(this.file).slice(0, 10);
    return this.meta.getOrSet('namespace', def);
  }

  get cache_dir() {
    return path.join(
      this.cwd,
      config('azk_dir'),
      this.file_relative
    )
  }

  static find_manifest(target) {
    var dir = Utils.cd(target, function() {
      return parent(file_name);
    });
    return dir ? path.join(dir, file_name) : null;
  }

  static makeFake(cwd, image) {
    var file = path.join(cwd, file_name);
    var manifest = new Fake(null, file);

    return manifest.addSystem("--tmp--", {
      image: image,
      workdir: "/azk/#{manifest.dir}",
      mounts: {
        "/azk/#{manifest.dir}": "#{manifest.path}"
      }
    });
  }
}

class Fake extends Manifest {
  constructor(...args) {
    super(...args);
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
    }
  }
  parse() {}
}

export { file_name, System };
