"use strict";
var __moduleName = "src/cmds/logs";
var $__2 = require('azk'),
    log = $__2.log,
    _ = $__2._,
    async = $__2.async,
    defer = $__2.defer,
    config = $__2.config,
    Q = $__2.Q,
    t = $__2.t;
var $__2 = require('azk/cli/command'),
    Command = $__2.Command,
    Helpers = $__2.Helpers;
var Manifest = require('azk/manifest').Manifest;
var ReadableStream = require('memory-streams').ReadableStream;
var docker = require('azk/docker').default;
var moment = require('moment');
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {
  action: function(opts) {
    return async(this, function() {
      var manifest,
          systems;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return Helpers.requireAgent();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              manifest = new Manifest(this.cwd, true);
              systems = manifest.getSystemsByName(opts.system);
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return this.logs(manifest, systems, opts);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  make_out: function(output, name) {
    return {write: function(buffer) {
        var data = buffer.toString().match(/^\[(.*?)\](.*\n)$/m);
        if (data) {
          output.write((data[1].magenta + " " + name + ":" + data[2]));
        } else {
          output.write((name + " "));
          output.write(buffer);
        }
      }};
  },
  connect: function(system, color, instances, options) {
    var $__0 = this;
    return _.map(instances, (function(instance) {
      var name = ("" + system.name + instance.Annotations.azk.seq)[color];
      var container = docker.getContainer(instance.Id);
      var stdout = $__0.make_out(process.stdout, name);
      var stderr = $__0.make_out(process.stderr, name);
      return container.logs(options).then((function(stream) {
        return defer((function(resolve, reject) {
          container.modem.demuxStream(stream, stdout, stderr);
          stream.on('end', resolve);
        }));
      }));
    }));
  },
  logs: function(manifest, systems) {
    var opts = arguments[2] !== (void 0) ? arguments[2] : {};
    var $__0 = this;
    var options = {
      stdout: true,
      stderr: true,
      tail: opts.lines,
      timestamps: opts.timestamps
    };
    if (opts.follow) {
      options.follow = true;
    }
    var colors = ["green", "yellow", "blue", "red", "cyan", "grey"];
    var color = -1;
    return Q.all(_.map(systems, (function(system) {
      return system.instances({type: "daemon"}).then((function(instances) {
        color++;
        if (opts.instances) {
          opts.instances = opts.instances.split(',');
          instances = _.filter(instances, (function(instance) {
            return _.contains(opts.instances, instance.Annotations.azk.seq);
          }));
        }
        return Q.all($__0.connect(system, colors[color % colors.length], instances, options));
      }));
    })));
  }
}, {}, Command);
;
function init(cli) {
  (new Cmd('logs [system] [instances]', cli)).addOption(['--follow', '--tail', '-f'], {default: false}).addOption(['--lines', '-n'], {
    type: Number,
    default: "all"
  }).addOption(['--timestamps'], {default: true});
}
module.exports = {
  get Cmd() {
    return Cmd;
  },
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=logs.js.map