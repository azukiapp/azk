import { _, path, config } from 'azk';
import { utils as Utils } from 'azk';

class docker {
  // TODO: Add test
  static resolvePath(target, point = config('agent:vm:mount_point')) {
    target = Utils.resolve(target);
    if (config('agent:requires_vm')) {
      target = path.join(point, target);
    }

    return target;
  }
}

export default docker;
