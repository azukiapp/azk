var Q     = require('q');
var net   = require('net');
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

utils.ping = function(opts) {
  return Q.nfcall(net.connect, opts).then(function() {
    return true;
  }, function() {
    return false;
  });
}

utils.net_ip = function(ip) {
  return ip.replace(/^(.*)\..*$/, "$1.1");
}

module.exports = utils;
