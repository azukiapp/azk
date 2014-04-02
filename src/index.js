require('traceur');
import { version } from 'package.json';
import { get } from 'azk/config';

var Q = require('q');

export class Azk {
  static get version() { return version };
}

export { Q, get as config };
export default Azk;
