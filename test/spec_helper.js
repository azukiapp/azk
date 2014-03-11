var path   = require('path');
var chai   = require('chai');
var tmp    = require('tmp');
var exec   = require('child_process').exec;
var qfs    = require('q-io/fs');
var child  = require('child_process');
var MemoryStream  = require('memorystream');
var StdOutFixture = require('fixture-stdout');

var azk    = require('../lib/azk');
var docker = require('../lib/docker');
var Agent  = require('../lib/agent');
var App    = require('../lib/app');
var cli    = require('../lib/cli');

// Shortcuts
var Q = azk.Q;
var _ = azk._;

//process.env.AZK_DEBUG  = "azk:*";
azk.cst.DOCKER_NS_NAME = "azk-test-";

// Extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));

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
  })
});

before(function() {
  this.timeout(0);

  return Q.async(function* () {
    var removes    = [];
    var images     = yield docker.listImages();
    var containers = yield docker.listContainers({ all: true });

    _.each(containers, function(container) {
      container = docker.getContainer(container.Id);
      removes.push(container.stop({ f: 5 }).then(function() {
        return container.remove();
      }));
    });
    yield Q.all(removes);

    removes = [];
    _.each(images, function(image) {
      _.each(image.RepoTags, function(tag) {
        if (tag.match(/azk-test-/)) {
          removes.push(docker.getImage(tag).remove().fail(function() { }));
        }
      });
    });
    return yield Q.all(removes);
  })();
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

    outputs.__proto__.show = function() {
      console.log("Stdout:");
      process.stdout.write(this.stdout);
      console.log("Stderr:");
      process.stdout.write(this.stderr);
    }

    outputs.__proto__.reset = function() {
      mocks.stdout = new MemoryStream();
      mocks.stderr = new MemoryStream();

      mocks.stdout.on('data', function(data) {
        outputs.stdout += data.toString();
      });
      mocks.stderr.on('data', function(data) {
        outputs.stderr += data.toString();
      });
    }

    outputs.reset();

    if (extra)
      extra.call(this);
  });

  return mocks;
}

var count_apps = 0;
Helper.mock_app = function(data) {
  count_apps++;
  data = _.extend({
    id  : "azk-test-" + count_apps,
    box : azk.cst.DOCKER_DEFAULT_IMG,
    envs: {
      dev: {
        env: {
          "ENVS_ENV_VAR": "bar"
        }
      }
    },
    build: [],
    services: {
      web: {
        command:
          'while true ; do ' +
            'echo "init"; ' +
            '(echo -e "HTTP/1.1\\n\\n $(date)") | nc -l 1500; ' +
            'test $? -gt 128 && break; ' +
            'sleep 1; ' +
          'done',
        port: 1500
      },

      web2: {
        command:
          'while true; do ' +
            'env; sleep 1; ' +
          'done;'
      }
    },
  }, data || {});

  return Q.async(function* () {
    var tmp    = yield Helper.tmp.dir({ prefix: "azk-test-" });
    var m_file = path.join(tmp, azk.cst.MANIFEST);
    var e_file = path.join(tmp, ".env");

    yield qfs.write(m_file, JSON.stringify(data));
    yield qfs.write(e_file, "FOO=bar\nBAZ=qux");

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

var fixtures = {
  stdout: new StdOutFixture(),
  stderr: new StdOutFixture({ stream: process.stderr }),
}

Helper.capture_io = function(block) {
  return Q.when(null, function() {
    var writes = { stdout: '', stderr: '' };

    // Capture a write to stdout
    _.each(fixtures, function(fixture, key) {
      fixture.capture( function onWrite (string, encoding, fd) {
        writes[key] += string;
        return false;
      });
    });

    var fail = function(err) {
      _.each(fixtures, function(fixture) { fixture.release(); });
      throw err;
    }

    try {
      var result = block();
    } catch (err) { return fail(err) };

    return Q.when(result, function(value) {
      _.each(fixtures, function(fixture) { fixture.release(); });
      return [value, writes];
    }, fail);
  });
}

Helper.capture_evs = function(events) {
  var make_func = function(type) {
    return function() {
      var args = _.toArray(arguments);
      args.unshift(type);
      events.push(args);
    }
  }

  return {
    log  : make_func("log"),
    fail : make_func("fail"),
    ok   : make_func("ok")
  }
}
