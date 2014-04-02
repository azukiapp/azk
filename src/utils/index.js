
import { join } from 'path';

var Utils = {
  cd(target, func) {
    var old    = process.cwd();
    process.chdir(target);
    var result = func();
    process.chdir(old);

    return result;
  },

  resolve(...path) {
    return Utils.cd(join(...path), function() {
      return process.cwd();
    });
  }
};

export default Utils;
