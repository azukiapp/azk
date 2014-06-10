"use strict";
var __moduleName = "src/cli/index";
var $__1 = require('azk'),
    _ = $__1._,
    Q = $__1.Q,
    log = $__1.log,
    t = $__1.t;
var Cli = require('azk/cli/cli').Cli;
var UI = require('azk/cli/ui').UI;
var $__1 = require('azk/utils/errors'),
    InvalidValueError = $__1.InvalidValueError,
    AzkError = $__1.AzkError;
var path = require('path');
var cmds_path = path.join(__dirname, "..", "cmds");
var CmdCli = function CmdCli() {
  $traceurRuntime.defaultSuperCall(this, $CmdCli.prototype, arguments);
};
var $CmdCli = CmdCli;
($traceurRuntime.createClass)(CmdCli, {
  invalidCmd: function(error) {
    this.fail("commands.not_found", error.value);
    this.showUsage();
    return Q(1);
  },
  action: function(opts, parent_opts) {
    if (opts.version) {
      opts.command = "version";
    }
    if (opts.help || (_.isEmpty(opts.command) && _.isEmpty(opts.__leftover))) {
      this.showUsage();
      return Q(0);
    }
    if (opts.log) {
      log.setConsoleLevel(opts.log);
    }
    return $traceurRuntime.superCall(this, $CmdCli.prototype, "action", [opts, parent_opts]);
  }
}, {}, Cli);
function cli(args, cwd) {
  var ui = arguments[2] !== (void 0) ? arguments[2] : UI;
  try {
    var azk_cli = new CmdCli('azk', ui, cmds_path);
    azk_cli.addOption(['--version', '-v'], {
      default: false,
      show_default: false
    });
    azk_cli.addOption(['--log', '-l'], {type: String});
    azk_cli.addOption(['--help', '-h'], {show_default: false});
    azk_cli.addExamples(t("commands.azk.examples"));
    azk_cli.cwd = cwd;
    var result = azk_cli.run(_.rest(args, 2));
  } catch (e) {
    var result = (e instanceof InvalidValueError && e.option == "command") ? azk_cli.invalidCmd(e) : Q.reject(e);
  }
  if (Q.isPromise(result)) {
    result.then((function(code) {
      ui.exit(code ? code : 0);
    }), (function(error) {
      if (error instanceof AzkError) {
        ui.fail(error.toString());
      } else {
        ui.fail(error.stack ? error.stack : error);
      }
      ui.exit(error.code ? error.code : 127);
    }));
  }
}
module.exports = {
  get cli() {
    return cli;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map