import { sync as parent } from 'parentpath';
import { cst, config } from 'azk';
import Utils from 'azk/utils';
import { runInNewContext } from 'vm';
import { readFileSync } from 'fs';

var path = require('path');
var file_name = config('MANIFEST');

export class Manifest {
  constructor(cwd) {
    this.file    = Manifest.find_manifest(cwd);
    this.images  = {};
    this.systems = {};

    if (this.file) {
      this.parse();
    }
  }

  parse() {
    var content = readFileSync(this.file);

    runInNewContext(content, {
      systems: this.system.bind(this),
      imageAlias: this.imageAlias.bind(this),
    }, this.file);
  }

  system(name, data) {
    this.systems[name] = data;
  }

  imageAlias(name, image) {
    this.images[name] = image;
  }

  static find_manifest(target) {
    var dir = Utils.cd(target, function() {
      return parent(file_name);
    });
    return dir ? path.join(dir, file_name) : null;
  }
}

export { file_name };
