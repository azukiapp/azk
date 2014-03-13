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

utils.promise_notify = function(func) {
  var done   = Q.defer();
  func(done.notify).then(done.resolve, done.reject);
  return done.promise;
}

utils.S = new(function() {
  var STOPPED = function(value) {
    this.value = value
  };

  this.return = function(value) {
    throw new STOPPED(value)
  }

  this.stoppable = function(promise) {
    return promise.fail(function(msg) {
      if (msg instanceof STOPPED) {
        return Q.resolve(msg.value);
      } else {
        return Q.reject(msg);
      }
    });
  }
})

module.exports = utils;
