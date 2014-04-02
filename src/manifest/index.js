import { sync as parent } from 'parentpath';
import { cst, config } from 'azk';
import Utils from 'azk/utils';

export class Manifest {
  static find_manifest(target) {
    var dir = Utils.cd(target, function() {
      return parent(config('MANIFEST'));
    });
    return dir ? path.join(dir, config('MANIFEST')) : null;
  }
}
