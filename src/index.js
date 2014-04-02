require('traceur');
import { version } from 'package.json';

var Q = require('q');

export class Azk {
  static get version() { return version };
}

export { Q };
export default Azk;
