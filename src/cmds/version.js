import { CliController } from 'cli-router';
import Azk from 'azk';

class Version extends CliController {
  index() {
    this.ui.output("azk %s", Azk.version);
    return 0;
  }
}

module.exports = Version;
