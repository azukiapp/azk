var azk  = require('../azk');
var sha1 = require('../utils/sha1');
var fs   = require('fs');
var path = require('path');

var _ = azk._;
var Q = azk.Q;

var regex = {
  github: /^([\w-]+\/[\w-]+)#?(\w*)$/m,
  path:   /^(.{0,2}\/.*)$/m,
  docker: /^([\w|\-|\/]*):(.*)$/m,
}

var github_url = 'https://github.com/'

function Box(box_name) {
  // Github
  var repo = box_name.match(regex.github)
  if (repo) {
    return this.github_capture(repo[1], repo[2]);
  }

  // Path
  if (box_name.match(regex.path)) {
    return this.path_capture(box_name);
  }

  //-- Docker
  if (image = box_name.match(regex.docker)) {
    return this.docker_capture(image[1], image[2]);
  }

  throw new Error(azk.t("app.box.invalid", box_name));
}

Box.prototype.docker_capture = function(image, version) {
  _.extend(this, {
    type       : 'docker',
    origin     : null,
    path       : null,
    version    : version,
    repository : image,
    image      : image + ':' + version,
  });
}

Box.prototype.github_capture = function(repo, version) {
  version = version != '' ? version : "master";

  _.extend(this, {
    type       : 'github',
    origin     : github_url + repo,
    path       : repo,
    version    : version,
    repository : repo,
    image      : repo + ':' + version,
  });
}

Box.prototype.path_capture = function(source) {
  var source = path.resolve(source);
  var repo   = source.replace(/^\//, '').replace(/\/$/, "");

  if (fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    var version = sha1.calculateSync(source);
    _.extend(this, {
      type       : 'path',
      origin     : null,
      path       : source,
      version    : version,
      repository : repo,
      image      : repo + ':' + version,
    });
  } else {
    throw new Error("box directory '" + source + "' not found");
  }
}

module.exports = Box;
