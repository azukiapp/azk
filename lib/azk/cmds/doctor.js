"use strict";
var __moduleName = "src/cmds/doctor";
var $__1 = require('azk'),
    _ = $__1._,
    async = $__1.async,
    config = $__1.config;
var Command = require('azk/cli/command').Command;
var Client = require('azk/agent/client').Client;
var Azk = require('azk').default;
var docker = require('azk/docker').default;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {
  action: function(opts) {
    return async(this, function() {
      var agent,
          require_vm,
          data,
          render,
          $__2,
          $__3,
          $__4,
          $__5,
          $__6,
          $__7,
          $__8,
          $__9,
          $__10,
          $__11,
          $__12,
          $__13,
          $__14,
          $__15,
          $__16,
          $__17,
          $__18;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return Client.status();
            case 2:
              agent = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              require_vm = config("agent:requires_vm");
              $ctx.state = 21;
              break;
            case 21:
              $__2 = Azk.version;
              if (require_vm) {
                $__3 = agent.agent;
                $__4 = !$__3;
              } else {
                $__4 = require_vm;
              }
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = ($__4) ? 13 : 9;
              break;
            case 13:
              $__5 = "down".red;
              $__6 = {Version: $__5};
              $__10 = $__6;
              $ctx.state = 14;
              break;
            case 9:
              $__7 = docker.version;
              $__8 = $__7.call(docker);
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return $__8;
            case 6:
              $__9 = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $__10 = $__9;
              $ctx.state = 14;
              break;
            case 14:
              if (require_vm) {
                $__11 = "yes".green;
                $__13 = $__11;
              } else {
                $__12 = "no".yellow;
                $__13 = $__12;
              }
              $__14 = agent.agent;
              if ($__14) {
                $__15 = "up".green;
                $__17 = $__15;
              } else {
                $__16 = "down".red;
                $__17 = $__16;
              }
              $__18 = {
                version: $__2,
                docker: $__10,
                use_vm: $__13,
                agent_running: $__17
              };
              data = $__18;
              $ctx.state = 19;
              break;
            case 19:
              render = opts.logo ? this.render_with_logo : this.render_normal;
              this.output(render.apply(this, [data]));
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  render_with_logo: function(data) {
    var data_string = this.render_normal(data);
    data_string = data_string.split("\n");
    return ("\n               " + "##########".blue + "\n           " + "##################".blue + "\n         " + "######################".blue + "\n        " + "########################".blue + "      " + data_string[1] + "\n       " + "#################  #######".blue + "     " + data_string[2] + "\n      " + "##################  ########".blue + "    " + data_string[3] + "\n     " + "####     ##       #  ###  ####".blue + "   " + data_string[4] + "\n     " + "########  ####   ##  #  ######".blue + "\n     " + "###  ###  ##   ####  ##  #####".blue + "\n      " + "##    #  #       #  ###  ###".blue + "\n       " + "##########################".blue + "\n        " + "########################".blue + "\n         " + "######################".blue + "\n            " + "################".blue + "\n               " + "##########".blue + "\n    ");
  },
  render_normal: function(data) {
    return ("\n      " + "Azk".cyan + "   : " + data.version.blue + "\n      " + "Agent".cyan + " : " + data.agent_running + "\n      " + "Docker".cyan + ": " + data.docker.Version + "\n      " + "Use vm".cyan + ": " + data.use_vm + "\n    ");
  }
}, {}, Command);
function init(cli) {
  (new Cmd('doctor', cli)).addOption(['--logo'], {default: false});
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=doctor.js.map