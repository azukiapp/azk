// Original require save
var Module   = require('module');
var pretty   = require('pretty-hrtime');
var archy    = require('archy');
var chalk    = require('chalk');
var original = Module.prototype.require;
var nivel    = parseInt(process.env.AZK_PROFILE_REQUIRES) || 20;
var tree     = { label: chalk.blue(`requires (nivel: ${nivel}) :`), nodes: []};
var actual   = tree;
var cache    = {};

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
        time = chalk.red(time);
      } else if (ms > nivel) {
        time = chalk.yellow(time);
      } else {
        time = chalk.green(time);
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
