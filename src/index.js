require('traceur');
import { version } from 'package.json';
import { get } from 'azk/config';

var Q = require('q');
var _ = require('underscore');

export class Azk {
  static get version() { return version };
}

export { Q, _ as unders, get as config };
export default Azk;
