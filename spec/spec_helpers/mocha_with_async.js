import { path } from 'azk';
import { async } from 'azk/utils/promises';

function isGeneratorFunction (fn) {
  return typeof fn === 'function' &&
    fn.constructor &&
    fn.constructor.name === 'GeneratorFunction';
}

export function extend() {
  var suffix    = path.sep + path.join('', 'mocha', 'index.js');
  var children  = require.cache || {};

  var modules = Object.keys(children).filter(function (child) {
    return child.slice(suffix.length * -1) === suffix;
  }).map(function (child) {
    return children[child].exports;
  });

  modules.forEach((mocha) => {
    var Runnable = mocha.Runnable;
    var run = Runnable.prototype.run;

    if (Runnable.__generatorsIsLoaded) {
      return true;
    }

    Runnable.prototype.run = function (fn) {
      if (isGeneratorFunction(this.fn)) {
        var _fn = this.fn;
        this.fn = () => async(this, _fn);
      }

      return run.call(this, fn);
    };

    Runnable.__generatorsIsLoaded = true;
  });
}
