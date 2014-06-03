import { sync as parent } from 'parentpath';
import { path, fs, config, _ } from 'azk';
import { runInNewContext } from 'vm';
import { System } from 'azk/manifest/system';
import { createSync as createCache } from 'fscache';
import { sync as mkdir } from 'mkdirp';
import Utils from 'azk/utils';

var file_name = config('manifest');

var ManifestDsl = {
  system(name, data) {
    this.addSystem(name, data);
  },

  systems(systems) {
    _.each(systems, (system, name) => {
      this.addSystem(name, system);
    });
  },

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

function createDslContext(target) {
  var context = {};
  _.each(ManifestDsl, (func, name) => {
    context[name] = func.bind(target);
  });
  return context;
}

class Meta {
  constructor(manifest, cache = null) {
    this.manifest = manifest;
  }

  set cache(value) {
    this.__cache = value;
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
  constructor(cwd, file = null) {
    this.images  = {};
    this.systems = {};
    this.bins    = {};
    this.default = null;
    this.file    = file || Manifest.find_manifest(cwd);
    this.meta    = new Meta(this);
  }

  parse() {
    var content = fs.readFileSync(this.file);
    runInNewContext(content, createDslContext(this), this.file);
  }

  addSystem(name, data) {
    if (!(data instanceof System)) {
      var image = data.image;
      delete data.image;
      data  = new System(this, name, image, data);
    }

    this.systems[name] = data;
    if (!this.default) this.default = name;

    return this;
  }

  system(name) {
    return this.systems[name];
  }

  setMeta(...args) {
    this.meta.set(...args);
    return this;
  }

  getMeta(...args) {
    return this.meta.getOrSet(...args);
  }

  get systemDefault() {
    return this.system(this.default);
  }

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
    if (fs.existsSync(value)) {
      this.parse();
    }
  }

  get file_relative() {
    return path.relative(this.manifestPath, this.file);
  }

  get namespace() {
    var def = Utils.calculateHash(this.file).slice(0, 20);
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

    return manifest.addSystem("__tmp__", {
      image: image,
      workdir: "/azk/<%= manifest.dir %>",
      sync_files: {
        ".": "/azk/<%= manifest.dir %>",
      },
    });
  }
}

class Fake extends Manifest {
  constructor(...args) {
    super(...args);
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
    }
  }
  parse() {}
}

export { file_name, System };
