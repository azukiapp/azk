import { sync as parent } from 'parentpath';
import { path, config, _ } from 'azk';
import { runInNewContext } from 'vm';
import { readFileSync } from 'fs';
import { System } from 'azk/manifest/system';
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

export class Manifest {
  constructor(cwd) {
    this.file    = Manifest.find_manifest(cwd);
    this.images  = {};
    this.systems = {};
    this.bins    = {};
    this.default = null;

    if (this.file) {
      this.namespace = Utils.calculateHash(this.file).slice(0, 20);
      this.parse();
    }
  }

  parse() {
    var content = readFileSync(this.file);
    runInNewContext(content, createDslContext(this), this.file);
  }

  addSystem(name, data) {
    if (!(data instanceof System)) {
      var image = data.image;
      delete data.image;
      data  = new System(this, name, image, data);
    }

    this.systems[name] = data;
  }

  system(name) {
    return this.systems[name];
  }

  get systemDefault() {
    return this.system(this.default);
  }

  get manifestPath() {
    return path.dirname(this.file);
  }

  static find_manifest(target) {
    var dir = Utils.cd(target, function() {
      return parent(file_name);
    });
    return dir ? path.join(dir, file_name) : null;
  }
}

export { file_name, System };
