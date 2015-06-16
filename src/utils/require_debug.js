// Original require save
var Module = require('module');
var pretty = require('pretty-hrtime');
var archy  = require('archy');
var original = Module.prototype.require;
require('colors');

var nivel  = parseInt(process.env.AZK_PROFILE_REQUIRES) || 20;
var tree   = { label: `requires (nivel: ${nivel}) :`.blue, nodes: []};
var actual = tree;
var cache  = {};

Module.prototype.require = function(file, ...args) {
  var result, require = () => {
    return original.apply(this, [file, ...args]);
  };

  if (!cache[file]) {
    cache[file] = true;
    var azk  = file.match(/.*azk.*/);
    var root = actual;
    actual = { label: file, nodes: [] };

    // Run
    var hrstart = process.hrtime();
    result = require();
    var hrend = process.hrtime(hrstart);

    // Show time
    var ms = hrend[1] / 1000000;
    if (azk || hrend[0] >= 1 || ms > nivel) {
      var time = pretty(hrend, { precise: true });
      if (ms > (nivel * 1.5)) {
        time = time.red;
      } else if (ms > nivel) {
        time = time.yellow;
      } else {
        time = time.green;
      }
      actual.label = `${file} - (${time})`;
      root.nodes.push(actual);
    }

    actual = root;
  } else {
    result = require();
  }

  return result;
};

module.exports = function() {
  return archy(tree);
};
