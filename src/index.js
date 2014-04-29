require('traceur');
import { version } from 'package.json';
import { get as config }  from 'azk/config';
import { Q, _, i18n, defer } from 'azk/utils';

export class Azk {
  static get version() { return version };
}

function pp(...args) {
  return console.log(...args);
}

// Default i18n method
var t = new i18n({ locale: config('locale') }).t;

export { pp, t, defer };
export { Q, _ as unders, _, config };
export default Azk;
