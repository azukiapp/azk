var azk  = require('../azk');
var sha1 = require('../utils/sha1');
var fs   = require('q-io/fs');
var path = require('path');

var _ = azk._;
var Q = azk.Q;

var regex = {
  github: /^([\w|-]+\/[\w|-]+)#?(\w*)$/m,
  path:   /^(.{0,2}\/.*)$/m,
  docker: /^([\w|-|\/]*):(.*)$/m,
}

var github_url = 'https://github.com/'

var Box = {
  parse: function(box_name) {
    var deferred = Q.defer();

    // Github
    var repo = box_name.match(regex.github)
    if (repo) {
      deferred.resolve(
        this.github_capture(repo[1], repo[2])
      );
    }

    // Path
    if (box_name.match(regex.path)) {
      deferred.resolve(
        this.path_capture(box_name)
      );
    }

    //-- Docker
    if (image = box_name.match(regex.docker)) {
      deferred.resolve(
        this.docker_capture(image[1], image[2])
      );
    }

    deferred.reject(new Error(azk.t("app.box.invalid", box_name)));
    return deferred.promise;
  },

  docker_capture: function(image, version) {
    return {
      type       : 'docker',
      origin     : null,
      path       : null,
      version    : version,
      repository : image,
      image      : image + ':' + version,
    };
  },

  github_capture: function(repo, version) {
    version = version != '' ? version : "master";

    return {
      type       : 'github',
      origin     : github_url + repo,
      path       : repo,
      version    : version,
      repository : repo,
      image      : repo + ':' + version,
    };
  },

  path_capture: function(source) {
    var source = path.resolve(source);
    var repo = source.replace(/^\//, '').replace(/\/$/, "");

    return (Q.async(function* () {
      if (yield fs.isDirectory(source)) {
        var version = yield sha1.calculate(source);
        return {
          type       : 'path',
          origin     : null,
          path       : source,
          version    : version,
          repository : repo,
          image      : repo + ':' + version,
        };
      }

      throw new Error("box directory '" + path + "' not found");
    }))();
  }
}

module.exports = Box;
