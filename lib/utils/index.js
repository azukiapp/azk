var utils = {}

utils.cd = function(target, func) {
  var old    = process.cwd();
  process.chdir(target);
  var result = func();
  process.chdir(old);

  return result;
}

utils.resolve = function(path) {
  return utils.cd(path, function() {
    return process.cwd();
  });
};

module.exports = utils;
