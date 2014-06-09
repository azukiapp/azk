"use strict";
var __moduleName = "src/cmds/init";
var $__1 = require('azk'),
    Q = $__1.Q,
    _ = $__1._,
    config = $__1.config,
    t = $__1.t,
    fs = $__1.fs,
    path = $__1.path;
var $__1 = require('azk/cli/command'),
    Command = $__1.Command,
    Helpers = $__1.Helpers;
var $__1 = require('azk/generator'),
    generator = $__1.generator,
    example_system = $__1.example_system;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
    var manifest = config("manifest");
    var cwd = opts.path || this.parent.cwd;
    var file = path.join(cwd, manifest);
    if (fs.existsSync(file) && !opts.force) {
      this.fail(this.tKeyPath("already"), manifest);
      return 1;
    }
    var systems = generator.findSystems(cwd);
    generator.render({systems: _.isEmpty(systems) ? [example_system] : systems}, file);
    this.ok(this.tKeyPath('generated'), manifest);
    this.tOutput(this.tKeyPath('github'));
    return 0;
  }}, {}, Command);
function init(cli) {
  (new Cmd('init [path]', cli)).addOption(['--force', '-f'], {default: false});
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=init.js.map