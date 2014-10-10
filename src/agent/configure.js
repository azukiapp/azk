import { os, Q, async } from 'azk';
import { config, set_config } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { OSNotSupported, DependencieError } from 'azk/utils/errors';

// Search for command in path
var which = require('which');

export class Configure extends UIProxy {
  constructor(user_interface) {
    super(user_interface);
  }

  // Run configures and checks by operational system
  run() {
    var method = this[os.platform()];
    if (method) {
      return method.apply(this);
    } else {
      throw new OSNotSupported(os.platform());
    }
  }

  // Mac OS X configure and checks
  darwin() {
    return Q.all([
      this._which('VBoxManage'),
      this._which('unfsd'),
    ]);
  }

  // Linux configure and checks
  //linux() {
  //}

  _which(command) {
    return Q
      .nfcall(which, command)
      .fail(() => {
        throw new DependencieError(command);
      });
  }
}
