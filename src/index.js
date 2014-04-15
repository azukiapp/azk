require('traceur');
import { version } from 'package.json';
import { get as config }  from 'azk/config';
import { Q, _, i18n } from 'azk/utils';

export class Azk {
  static get version() { return version };
}

function pp(...args) {
  return console.log(...args);
}

function defer(func) {
  var done   = Q.defer();
  var result = func(done);
  if (Q.isPromise(result)) {
    result.progress(done.notify).then(done.resolve, done.reject);
  }
  return done.promise;
}

// Default i18n method
var t = new i18n({ locale: config('locale') }).t;

export { pp, t, defer };
export { Q, _ as unders, _, config };
export default Azk;
