import { path, fs, config, _, t, lazy_require, isBlank } from 'azk';
import { System } from 'azk/system';
import { Validate } from 'azk/manifest/validate';
import { ManifestError, ManifestRequiredError, SystemNotFoundError } from 'azk/utils/errors';
import Utils from 'azk/utils';
import { Meta, FakeCache } from 'azk/manifest/meta';

var file_name = config('manifest');
var check     = require('syntax-error');
var tsort     = require('gaia-tsort');

/* global parent, runInNewContext */
lazy_require(this, {
  parent         : ['parentpath', 'sync'],
  runInNewContext: ['vm'],
});

var ManifestDsl = {
  console: console,
  require: require,
  env: process.env,
  disable: null,

  // Mounts
  path(folder, options = {}) {
    return { type: 'path', value: folder, options: options };
  },

  persistent(name, options = {}) {
    return { type: 'persistent', value: name, options: options };
  },

  // Systems
  system(name, data) {
    this.addSystem(name, data);
  },

  systems(allSystems) {
    this.extendsSystems(allSystems);
    _.each(allSystems, (data, name) => {
      this.addSystem(name, data);
    });
  },

  // Extra options
  addImage(name, image) {
    this.images[name] = image;
  },

  registerBin(name, ...args) {
    this.bins[name] = [...args];
  },

  setCacheDir(dir) {
    this.cache_dir = dir;
  },

  setDefault(name) {
    this.default = name;
  },
};

export class Manifest {
  constructor(cwd, file = null, required = false) {
    if (typeof file == "boolean") {
      [required, file] = [file, null];
    }

    if (required && !cwd) {
      throw new Error("Manifest class require a project path");
    }

    this.images   = {};
    this.systems  = {};
    this.bins     = {};
    this._default = null;
    this.file     = file || Manifest.find_manifest(cwd);

    if (required && !this._exist()) {
      throw new ManifestRequiredError(cwd);
    }

    // Create cache for application status
    if (_.isEmpty(this.cache_dir) && this._exist()) {
      this.cache_dir = path.join(this.cwd, config('azk_dir'), this._file_relative());
    }
    this.meta = new Meta(this);

    if (this._exist()) {
      this.parse();
    }
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
          throw new ManifestError(this.file, msg);
        }
        throw e;
      }
    }
    this.systemsInOrder();
  }

  static createDslContext(target) {
    return _.reduce(ManifestDsl, (context, func, name) => {
      if (_.isFunction(func)) {
        context[name] = func.bind(target);
      } else {
        context[name] = func;
      }
      return context;
    }, { });
  }

  extendsSystems(allSystems) {
    _.each(allSystems, (data, name) => {
      if (!(data instanceof System)) {
        if (data.extends) {
          // validate is extends system exists
          if (!allSystems[data.extends]) {
            var msg = t("manifest.extends_system_invalid", { system_source: data.extends,
              system_to_extend: name });
            throw new ManifestError(this.file, msg);
          }

          var sourceSystem = _.cloneDeep(allSystems[data.extends]);
          var destinationSystem = allSystems[name];

          // if "depends" or "image" is null ignore these properties
          if (isBlank(destinationSystem.depends)) {
            delete destinationSystem.depends;
          }
          if (isBlank(destinationSystem.image)) {
            delete destinationSystem.image;
          }

          // get all from sourceSystem but override with destinationSystem
          _.assign(sourceSystem, destinationSystem);
          allSystems[name] = sourceSystem;
        }
      }
    });

    return allSystems;
  }

  addSystem(name, data) {
    if (!(data instanceof System)) {
      this._system_validate(name, data);
      var image = data.image;
      delete data.image;
      data = new System(this, name, image, data);
    }

    this.systems[name] = data;
    if (!this._default) {
      this._default = name;
    }

    return this;
  }

  // TODO: refactoring to use validate
  _system_validate(name, data) {
    var msg, opts;
    if (!name.match(/^[a-zA-Z0-9-]+$/)) {
      msg = t("manifest.system_name_invalid", { system: name });
      throw new ManifestError(this.file, msg);
    }
    if (data.extends === name) {
      msg = t("manifest.cannot_extends_itself", { system: name });
      throw new ManifestError(this.file, msg);
    }
    if (_.isEmpty(data.image)) {
      msg = t("manifest.image_required", { system: name });
      throw new ManifestError(this.file, msg);
    }
    if (!_.isEmpty(data.balancer)) {
      msg = t("manifest.balancer_deprecated", { system: name });
      throw new ManifestError(this.file, msg);
    }
    if (!_.isEmpty(data.mount_folders)) {
      opts = { option: 'mount_folders', system: name, manifest: this.file };
      msg  = t("manifest.mount_and_persistent_deprecated", opts);
      throw new ManifestError(this.file, msg);
    }
    if (!_.isEmpty(data.persistent_folders)) {
      opts = { option: 'persistent_folders', system: name, manifest: this.file };
      msg  = t("manifest.mount_and_persistent_deprecated", opts);
      throw new ManifestError(this.file, msg);
    }
  }

  system(name, isRequired = false) {
    var sys = this.systems[name];

    if (isRequired && !sys) {
      throw new SystemNotFoundError(this.file, name);
    }

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
            });
            throw new ManifestError(this.file, msg);
          }
        });
      }
    });

    var result = tsort(edges);
    if (result.error) {
      var data = result.error.message.match(/^(.*?)\s.*\s(.*)$/);
      var msg  = t("manifest.circular_dependency", {
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
    var node = _.find(graph, (node) => { return node.id == node_id; });
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

  get default() {
    return this._default;
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

  set file(value) {
    this.cwd = path.dirname(value);
    this.__file = value;
  }

  _exist() {
    return fs.existsSync(this.file);
  }

  _file_relative() {
    return path.relative(this.manifestPath, this.file);
  }

  // TODO: make more fast
  get namespace() {
    var def = Utils.calculateHash(this.file).slice(0, 10);
    return this.meta.getOrSet('namespace', def);
  }

  set cache_dir(value) {
    this.__cache_dir = value;
  }

  get cache_dir() {
    return this.__cache_dir;
  }

  static find_manifest(target) {
    var dir = Utils.cd(target, function() {
      return parent(file_name);
    });
    return dir ? path.join(dir, file_name) : null;
  }

  static makeFake(cwd, image) {
    var file = path.join(cwd, file_name);
    var manifest = new FakeManifest(null, file);

    return manifest.addSystem("--tmp--", {
      image: image,
      workdir: "/azk/#{manifest.dir}",
      mounts: {
        "/azk/#{manifest.dir}": "#{manifest.path}"
      }
    });
  }
}

class FakeManifest extends Manifest {
  constructor(...args) {
    super(...args);
    this.meta.cache = new FakeCache();
  }
  parse() {}
}

export { file_name, System };
