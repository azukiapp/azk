"use strict";
var __moduleName = "src/docker/pull";
var $__0 = require('azk'),
    Q = $__0.Q,
    _ = $__0._,
    defer = $__0.defer;
var XRegExp = require('xregexp').XRegExp;
var $__0 = require('azk/utils/errors'),
    ProvisionNotFound = $__0.ProvisionNotFound,
    ProvisionPullError = $__0.ProvisionPullError;
var msg_regex = {
  pulling_another: new XRegExp('Repository.*another'),
  pulling_repository: new XRegExp('Pulling repository (?<repository>.*)'),
  pulling_layers: new XRegExp('Pulling dependent layers'),
  pulling_metadata: new XRegExp('Pulling metadata'),
  pulling_fs_layer: new XRegExp('Pulling fs layer'),
  pulling_image: new XRegExp('Pulling image \((?<tag>.*)\) from (?<repository>.*), endpoint: (?<endpoint>.*)'),
  download: new XRegExp('Downloading'),
  download_complete: new XRegExp('Download complete')
};
function parse_status(msg) {
  var result = {};
  _.find(msg_regex, (function(regex, type) {
    var match = XRegExp.exec(msg, regex);
    if (match) {
      result['type'] = type;
      _.each(regex.xregexp.captureNames, function(key) {
        if (match[key]) {
          result[key] = match[key];
        }
      });
      return true;
    }
  }));
  return result;
}
function pull(docker, repository, tag, stdout) {
  var image = (repository + ":" + tag);
  var promise = docker.createImage({
    fromImage: repository,
    tag: tag
  });
  return promise.then((function(stream) {
    return defer((function(resolve, reject, notify) {
      stream.on('data', (function(data) {
        var msg = JSON.parse(data.toString());
        msg.type = "pull_msg";
        if (msg.error) {
          if (msg.error.match(/404/) || msg.error.match(/not found$/)) {
            return reject(new ProvisionNotFound(image));
          }
          reject(new ProvisionPullError(image, msg.error));
        } else {
          msg.statusParsed = parse_status(msg.status);
          if (msg.statusParsed) {
            notify(msg);
          }
          if (stdout) {
            stdout.write(msg.status + "\n");
          }
        }
      }));
      stream.on('end', (function() {
        return resolve(docker.findImage(image));
      }));
    }));
  }));
}
module.exports = {
  get pull() {
    return pull;
  },
  __esModule: true
};
//# sourceMappingURL=pull.js.map