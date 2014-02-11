var path   = require('path');
var azk    = require('../lib/azk');
var chai   = require('chai');
var tmp    = require('tmp');
var docker = require('../lib/docker');
var Agent  = require('../lib/agent');
var exec   = require('child_process').exec;
var qfs    = require('q-io/fs');

// Shortcuts
var Q = azk.Q;
var _ = azk._;

// Extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));

// Remove tmp
tmp.setGracefulCleanup();

// Global setups
before(function() {
  return azk.init().then(function() {
    var done = Q.defer();

    process.on('agent:client:ready', function() {
      done.resolve(Q.fcall(function() {
        done.resolve();
      }));
    });

    Agent.start();

    return done.promise;
  });
});

after(function() {
  return docker.listContainers({ all: true })
  .then(function(containers) {
    return Q.all(_.map(containers, function(c) {
      c = docker.getContainer(c.Id)
      return Q.ninvoke(c, "kill")
      .then(function() {
        return Q.ninvoke(c, "remove");
      });
    }))
  })
  .then(function() {
    return docker.listImages()
    .then(function(images) {
      var removes = [];
      _.each(images, function(image) {
        if (!image.RepoTags[0].match(/ubuntu/)) {
          removes.push(docker.getImage(image.Id).remove());
        }
      });
      return Q.all(removes).fail(function(err) {
        if (err.statusCode != 404) {
          throw err;
        }
      });
    });
  });
});

var Helper = module.exports = {
  azk: azk,
  tmp: {
    dir: Q.denodeify(tmp.dir),
  },
  expect: chai.expect,
  fixture_path: function(fixture) {
    return path.resolve(
      path.join(__dirname, "fixtures", fixture)
    );
  }
}

var exec = Q.denodeify(exec);
Helper.make_git_repo = function(origin, dest) {
  return qfs.copyTree(origin, dest)
    .then(function() {
      var cmd = 'git init; git add .; git commit -m "first version";'
      return exec(cmd, { cwd: dest });
    })
    .then(function(stdout, stderr) {
      return path.join(dest, ".git");
    });
}

Helper.escapeRegExp = function(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

