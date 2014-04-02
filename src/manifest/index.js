import { cst } from 'azk';

export class Manifest {
  static find_manifest(target) {
    var dir = azk.utils.cd(target, function() {
      return parent(azk.cst.MANIFEST);
    });
    return dir ? path.join(dir, azk.cst.MANIFEST) : null;
  }
}
