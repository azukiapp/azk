// Original require save
var Module   = require('module');
var original = Module.prototype.require;

var cache = {};
Module.prototype.require = function(file, ...args) {
  var result, require = () => {
    return original.apply(this, [file, ...args]);
  };

  if (!cache[file]) {
    cache[file] = true;

    // Run
    var hrstart = process.hrtime();
    result = require();
    var hrend = process.hrtime(hrstart);

    // Show time
    var ms = hrend[1] / 1000000;
    if (hrend[0] >= 1 || ms > 20) {
      console.info("Load time (hr): %ds %dms - %s", hrend[0], ms, file);
    }
  } else {
    result = require();
  }

  return result;
};
