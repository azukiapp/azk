"use strict";
var __moduleName = "src/cmds/status";
var $__3 = require('azk'),
    log = $__3.log,
    _ = $__3._,
    async = $__3.async,
    config = $__3.config,
    t = $__3.t;
var $__3 = require('azk/cli/command'),
    Command = $__3.Command,
    Helpers = $__3.Helpers;
var Manifest = require('azk/manifest').Manifest;
var $__3 = require('azk/utils/errors'),
    SYSTEMS_CODE_ERROR = $__3.SYSTEMS_CODE_ERROR,
    NotBeenImplementedError = $__3.NotBeenImplementedError;
var moment = require('moment');
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
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
              return $Cmd.status(this, manifest, systems);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }}, {
  status: function(cli, manifest, systems) {
    return async(cli, function() {
      var columns,
          table_status,
          $__1,
          $__2,
          system,
          instances,
          hostname,
          ports,
          name,
          status,
          counter,
          provisioned,
          line;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              columns = ['', 'System'.blue, 'Instancies'.green, 'Hostname'.yellow, 'Instances-Ports'.magenta, "Provisioned".cyan];
              table_status = this.table_add('table_status', {head: columns});
              $ctx.state = 18;
              break;
            case 18:
              $__1 = systems[Symbol.iterator]();
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (!($__2 = $__1.next()).done) ? 13 : 15;
              break;
            case 13:
              system = $__2.value;
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 2;
              return system.instances({type: "daemon"});
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (system.balanceable && instances.length > 0) {
                hostname = system.url.underline;
              } else {
                hostname = system.hostname;
              }
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return $Cmd._ports_map(system, instances);
            case 6:
              ports = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              name = instances.length > 0 ? ("" + system.name).green : ("" + system.name).red;
              status = instances.length > 0 ? "↑".green : "↓".red;
              counter = system.scalable ? instances.length.toString().blue : 'n/s'.red;
              provisioned = system.provisioned;
              provisioned = provisioned ? moment(provisioned).fromNow() : "-";
              line = [status, name, counter, hostname, ports.join(', '), provisioned];
              this.table_push(table_status, line);
              $ctx.state = 12;
              break;
            case 15:
              this.table_show(table_status);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _ports_map: function(system, instances) {
    return async(function() {
      var instance,
          ports;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              ports = [];
              instances = _.clone(instances);
              while (instance = instances.pop()) {
                _.each(instance.NetworkSettings.Access, (function(port) {
                  var name = system.portName(port.name);
                  ports.push((instance.Annotations.azk.seq + "-" + name + ":" + (port.port || "n/m".red)));
                }));
              }
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = _.isEmpty(ports) ? ["-"] : ports;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
}, Command);
;
function init(cli) {
  (new Cmd('status [system]', cli));
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
//# sourceMappingURL=status.js.map