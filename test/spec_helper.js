var path   = require('path');
var chai   = require('chai');
var tmp    = require('tmp');
var exec   = require('child_process').exec;
var qfs    = require('q-io/fs');
var child  = require('child_process');
var MemoryStream = require('memorystream');

var azk    = require('../lib/azk');
var docker = require('../lib/docker');
var Agent  = require('../lib/agent');
var App    = require('../lib/app');

// Shortcuts
var Q = azk.Q;
var _ = azk._;

azk.cst.DOCKER_NS_NAME = "azk-test-";

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
  this.timeout(0);

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
        _.each(image.RepoTags, function(tag) {
          if (tag.match(/azk-test-/)) {
            removes.push(docker.getImage(tag).remove());
          }
        });
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
  Q  : Q,
  azk: azk,
  azk_bin: path.join(azk.cst.AZK_ROOT_PATH, 'bin', 'azk'),
  tmp: {
    dir: Q.denodeify(tmp.dir),
  },
  MemoryStream: MemoryStream,
  expect: chai.expect,
  fixture_path: function(fixture) {
    return path.resolve(
      path.join(__dirname, "fixtures", fixture)
    );
  }
}

var exec = Q.denodeify(exec);

Helper.escapeRegExp = function(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

Helper.remove_images = function(images) {
  if (!_.isArray(images))
    images = [images];

  var removes = _.map(images, function(image) {
    return docker.getImage(image).remove();
  });

  return Q.all(removes).fail(function(err) {
    if (err.statusCode == 404)
      return null;
    throw err;
  });
}

Helper.mock_outputs = function(func, outputs, extra) {
  var mocks = {};

  func(function() {
    // Clear
    outputs.stdout = '';
    outputs.stderr = '';

    mocks.stdout = new MemoryStream();
    mocks.stderr = new MemoryStream();

    mocks.stdout.on('data', function(data) {
      outputs.stdout += data.toString();
    });
    mocks.stderr.on('data', function(data) {
      outputs.stderr += data.toString();
    });

    if (extra)
      extra();
  });

  return mocks;
}

Helper.mock_exec = function(mocks, command) {
  return function(dir, args, stdin) {
    var done = Q.defer();
    var opts = {
      cwd: dir,
      env: _.extend({ DEBUG: "azk:*" }, process.env),
    }

    args.unshift(command);
    var exec = child.spawn(Helper.azk_bin, args, opts);

    if (stdin) {
      process.nextTick(function() {
        _.each(stdin, function(data) {
          exec.stdin.write(data + "\n");
        });
      });
    }

    exec.stdout.pipe(mocks.stdout);
    exec.stderr.pipe(mocks.stderr);
    exec.on("close", function(code) {
      done.resolve(code);
    });

    return done.promise;
  }
}

Helper.mock_app = function(data) {
  data = _.extend({
    id  : "azk-test-" + App.new_id(),
    box : "ubuntu:12.04",
    build: [],
    services: [],
  }, data || {});

  return Q.async(function* () {
    var tmp  = yield Helper.tmp.dir({ prefix: "azk-test-" });
    var file = path.join(tmp, azk.cst.MANIFEST);

    yield qfs.write(file, JSON.stringify(data));

    if (data.__git) {
      var cmd = 'git init; git add .; git commit -m "first version";'
      tmp = yield exec(cmd, { cwd: tmp })
        .then(function(stdout, stderr) {
          return path.join(tmp, ".git");
        });
    };

    return tmp;
  })();
}
