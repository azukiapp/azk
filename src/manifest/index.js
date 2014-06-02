import { sync as parent } from 'parentpath';
import { path, fs, config, _ } from 'azk';
import { runInNewContext } from 'vm';
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
  constructor(cwd, file = null) {
    this.images  = {};
    this.systems = {};
    this.bins    = {};
    this.default = null;
    this.file    = file || Manifest.find_manifest(cwd);
  }

  get file() {
    return this.__file;
  }

  set file(value) {
    this.cwd = path.dirname(value);
    this.__file = value;
    this.namespace = Utils.calculateHash(value).slice(0, 20);
    if (fs.existsSync(value)) {
      this.parse();
    }
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

  get systemDefault() {
    return this.system(this.default);
  }

  get manifestPath() {
    return this.cwd;
  }

  get manifestDirName() {
    return path.basename(this.manifestPath);
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
  parse() {}
}

export { file_name, System };
