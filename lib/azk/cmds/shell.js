"use strict";
var __moduleName = "src/cmds/shell";
var $__2 = require('azk'),
    _ = $__2._,
    path = $__2.path,
    config = $__2.config,
    t = $__2.t,
    async = $__2.async,
    defer = $__2.defer;
var $__2 = require('azk/cli/command'),
    Command = $__2.Command,
    Helpers = $__2.Helpers;
var Manifest = require('azk/manifest').Manifest;
var docker = require('azk/docker').default;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {
  action: function(opts, extras) {
    var progress = Helpers.newPullProgress(this);
    return async(this, function() {
      var $__0,
          cmd,
          dir,
          env,
          manifest,
          system,
          tty_default,
          tty,
          stdin,
          options,
          result;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__0 = this;
              cmd = $traceurRuntime.spread([opts.cmd], opts.__leftover);
              dir = this.cwd;
              env = {};
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 2;
              return Helpers.requireAgent();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              if (opts.image) {
                manifest = Manifest.makeFake(dir, opts.image);
                system = manifest.systemDefault;
              } else {
                manifest = new Manifest(dir, true);
                system = manifest.systemDefault;
                if (opts.system)
                  system = manifest.system(opts.system, true);
              }
              tty_default = opts.t || !_.isString(opts.command);
              tty = (opts.T) ? (opts.t || false) : tty_default;
              stdin = this.stdin();
              stdin.custom_pipe = (function() {});
              options = {
                interactive: tty,
                pull: this.stdout(),
                stdout: this.stdout(),
                stderr: this.stderr(),
                stdin: stdin,
                workdir: opts.cwd || null
              };
              options.envs = this._parse_option(opts.env, /.+=.+/, '=', 'invalid_env');
              options.mounts = this._parse_option(opts.mount, /.+:.+:?.*/, ':', 'invalid_mount', (function(opts) {
                return {
                  type: (opts[2] ? opts[1] : 'path'),
                  value: (opts[2] ? opts[2] : opts[1])
                };
              }));
              cmd = [opts.shell || system.shell];
              if (opts.command) {
                cmd.push("-c");
                cmd.push(opts.command);
              }
              options.remove = opts.remove;
              result = defer((function(resolver, reject) {
                var escape = (function(key, container) {
                  if (key === ".") {
                    process.nextTick((function() {
                      docker.getContainer(container).stop({t: 5000}).fail(reject);
                    }));
                    return true;
                  }
                  return false;
                });
                system.runShell(cmd, options).progress(Helpers.escapeCapture(escape)).then(resolver, reject);
              }));
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 6;
              return result.fail((function(error) {
                return $__0.parseError(error);
              }));
            case 6:
              result = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = result.code;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    }).progress(progress);
  },
  parseError: function(error) {
    if (error.statusCode) {
      if (error.statusCode === 404 && error.reason === "no such container") {
        this.fail("commands.shell.ended.removed");
        return {code: 127};
      }
    } else if (error.code === 'ECONNRESET') {
      this.fail("commands.shell.ended.docker_end");
      return {code: 127};
    } else if (error.code === 'ECONNREFUSED') {
      this.fail("commands.shell.ended.docker_notfound");
      return {code: 127};
    }
    throw error;
  },
  _parse_option: function(option, regex, split, fail) {
    var format = arguments[4] !== (void 0) ? arguments[4] : null;
    var result = {};
    for (var j = 0; j < option.length; j++) {
      var opt = option[j];
      if (opt.match(regex)) {
        opt = opt.split(split);
        result[opt[0]] = format ? format(opt) : opt[1];
      } else {
        this.fail('commands.shell.' + fail, {value: opt});
        return 1;
      }
    }
    return result;
  }
}, {}, Command);
function init(cli) {
  (new Cmd('shell [system]', cli)).addOption(['-T']).addOption(['-t']).addOption(['--remove', '--rm', '-r'], {default: true}).addOption(['--image', '-i'], {type: String}).addOption(['--command', '-c'], {type: String}).addOption(['--shell'], {type: String}).addOption(['--cwd', '-C'], {type: String}).addOption(['--mount', '-m'], {
    type: String,
    acc: true,
    default: []
  }).addOption(['--env', '-e'], {
    type: String,
    acc: true,
    default: []
  }).addOption(['--verbose', '-v']).addExamples(t("commands.shell.examples"));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=shell.js.map