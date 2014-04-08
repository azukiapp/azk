require('traceur');
import { version } from 'package.json';
import { get }     from 'azk/config';
import { Q, _ }    from 'azk/utils';

export class Azk {
  static get version() { return version };
}

function pp(...args) {
  return console.log(...args);
}

export { pp };
export { Q, _ as unders, _, get as config };
export default Azk;
