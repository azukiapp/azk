var h     = require('../spec_helper.js');
var child = require('child_process');
var MemoryStream = require('memorystream');
var path  = require('path');
var docker = require('../../lib/docker');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe.only("Azk exec command", function() {
  var stdout, stderr, outputs;

  beforeEach(function() {
    stdout = new MemoryStream();
    stderr = new MemoryStream();
    outputs = { stdout: '', stderr: '' };
    stdout.on('data', function(data) {
      outputs.stdout += data.toString();
    });
    stderr.on('data', function(data) {
      outputs.stderr += data.toString();
    });
  });

  function exec(args, stdin) {
    var done = Q.defer();
    var opts = {
      env: _.extend({ DEBUG: "azk:*" }, process.env),
    }

    args.unshift("exec");
    var exec = child.spawn(h.azk_bin, args, opts);

    if (stdin) {
      process.nextTick(function() {
        _.each(stdin, function(data) {
          exec.stdin.write(data + "\n");
        });
      });
    }

    exec.stdout.pipe(stdout);
    exec.stderr.pipe(stderr);
    exec.on("close", function(code) {
      done.resolve(code);
    });

    return done.promise;
  }

  it("should execute a command and remove a container", function() {
    var result = exec(["/bin/bash", "-c", "ls -l"])
    .then(function(code) {
      var stderr = outputs.stderr;
      var regex  = /azk:exec created: (.*)/;
      var id     = stderr.match(regex)[1];

      h.expect(stderr).to.match(regex);
      h.expect(id).to.match(/[0-9a-f]{64}/);

      return docker.getContainer(id).remove();
    });

    return h.expect(result)
      .to.eventually.rejectedWith(/404/);
  });

  it("should execute a command and not remove a container", function() {
    var result = exec(["-R", "/bin/bash", "-c", "ls -l"])
    .then(function(code) {
      var stderr = outputs.stderr;
      var regex  = /azk:exec created: (.*)/;
      var id     = stderr.match(regex)[1];

      h.expect(stderr).to.not.match(/removing container/);
      h.expect(stderr).to.match(regex);
      h.expect(id).to.match(/[0-9a-f]{64}/);

      return docker.getContainer(id).remove();
    });

    return h.expect(result).to.fulfilled;
  });

  it("should execute a interative command", function() {
    var result = exec(["-i", "/bin/bash"], ["uptime", "exit"])
    .then(function(code) {
      h.expect(outputs.stdout).to.match(/.*users.*load average.*/);
    });

    return h.expect(result).to.fulfilled;
  });
});
