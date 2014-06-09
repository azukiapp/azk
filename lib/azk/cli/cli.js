"use strict";
var __moduleName = "src/cli/cli";
var _ = require('azk')._;
var glob = require('glob').sync;
var $__2 = require('azk/cli/command'),
    Command = $__2.Command,
    Option = $__2.Option;
var InvalidValueError = require('azk/utils/errors').InvalidValueError;
var path = require('path');
;
var Cli = function Cli(name, user_interface, cmds_cwd) {
  $traceurRuntime.superCall(this, $Cli.prototype, "constructor", [name, user_interface, cmds_cwd]);
  if (cmds_cwd) {
    this.__load_cmds(cmds_cwd);
  }
};
var $Cli = Cli;
($traceurRuntime.createClass)(Cli, {
  initChildren: function(children) {
    this.addCmd(children);
  },
  __load_cmds: function(cwd) {
    var $__0 = this;
    var cmds = glob("*.js", {cwd: cwd});
    _.each(cmds, (function(cmd) {
      require(path.join(cwd, cmd)).init($__0);
    }));
  },
  addCmd: function(cmd) {
    var opt = _.find(this.stackable, (function(opt) {
      return opt.name == 'command';
    }));
    if (!opt) {
      opt = new Option({
        name: 'command',
        type: String,
        require: true,
        options: [],
        stop: true
      });
      this.stackable.push(opt);
    }
    opt.options.push(cmd);
    this.commands[cmd.name] = cmd;
  },
  showUsage: function() {
    var command = arguments[0] !== (void 0) ? arguments[0] : null;
    if (!command)
      return $traceurRuntime.superCall(this, $Cli.prototype, "showUsage", []);
    var cmd = this.commands[command];
    if (!cmd)
      throw new InvalidValueError('command', command);
    var prefix = this.usageLine("command");
    return cmd.showUsage(prefix);
  },
  action: function(opts, parent_opts) {
    var cmd = this.commands[opts.command];
    if (cmd && cmd instanceof Command) {
      return cmd.run(_.clone(opts.__leftover), opts);
    }
  }
}, {}, Command);
module.exports = {
  get Command() {
    return Command;
  },
  get Cli() {
    return Cli;
  },
  __esModule: true
};
//# sourceMappingURL=cli.js.map