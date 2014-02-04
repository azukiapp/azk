
var utils = {}

utils.cd = function(target, func) {
  var old    = process.cwd();
  process.chdir(target);
  var result = func();
  process.chdir(old);

  return result;
}

module.exports = utils;
