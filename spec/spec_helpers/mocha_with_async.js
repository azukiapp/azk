import { path, async } from 'azk';

export function extend() {
  var Generator = (function*() { yield undefined; }).constructor;
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

    Runnable.prototype.run = function (fn) {
      if (this.fn instanceof Generator) {
        var _fn = this.fn;
        this.fn = () => async(this, _fn);
      }

      return run.call(this, fn);
    };
  });
}
