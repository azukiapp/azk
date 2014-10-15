"use strict";
var __moduleName = "src/cli/ui";
var $__14 = require('azk'),
    _ = $__14._,
    Q = $__14.Q,
    t = $__14.t,
    defer = $__14.defer;
var Multibar = require('azk/cli/multi_bars').Multibar;
require('colors');
var execSh = require('exec-sh');
var Table = require('cli-table');
var printf = require('printf');
var inquirer = require('inquirer');
var mbars = [];
var tables = {};
var ok = 'azk'.green;
var fail = 'azk'.red;
var warning = 'azk'.yellow;
var info = 'azk'.blue;
var UI = {
  isUI: true,
  t: t,
  dir: function() {
    var $__15;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    ($__15 = console).dir.apply($__15, $traceurRuntime.toObject(args));
  },
  output: function(string) {
    for (var args = [],
        $__3 = 1; $__3 < arguments.length; $__3++)
      args[$__3 - 1] = arguments[$__3];
    this.stdout().write(printf.apply(null, $traceurRuntime.spread([string || ""], args)) + "\n");
  },
  tOutput: function() {
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    this.stdout().write(t.apply(null, $traceurRuntime.toObject(args)) + "\n");
  },
  outputWithLabel: function(rows) {
    var ident = arguments[1] !== (void 0) ? arguments[1] : '';
    var $__0 = this;
    rows = _.map(rows, (function(row) {
      return _.isArray(row) ? row : row.split('\t');
    }));
    var size = _.reduce(rows, (function(acc, row) {
      return acc > row[0].length ? acc : row[0].length;
    }), 0);
    _.each(rows, (function(row) {
      var $__15;
      ($__15 = $__0).output.apply($__15, $traceurRuntime.spread(["%s%-*s  %s", ident, row.shift(), size], row));
    }));
  },
  ok: function() {
    var $__15;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    ($__15 = this)._status.apply($__15, $traceurRuntime.spread([ok], args));
  },
  info: function() {
    var $__15;
    for (var args = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      args[$__6] = arguments[$__6];
    ($__15 = this)._status.apply($__15, $traceurRuntime.spread([info], args));
  },
  fail: function() {
    var $__15;
    for (var args = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      args[$__7] = arguments[$__7];
    ($__15 = this)._status.apply($__15, $traceurRuntime.spread([fail], args));
  },
  warning: function() {
    var $__15;
    for (var args = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      args[$__8] = arguments[$__8];
    ($__15 = this)._status.apply($__15, $traceurRuntime.spread([warning], args));
  },
  _status: function(tag) {
    for (var args = [],
        $__9 = 1; $__9 < arguments.length; $__9++)
      args[$__9 - 1] = arguments[$__9];
    var string = t.apply(null, $traceurRuntime.toObject(args)).replace(/^(.+)/gm, (tag + ": $1"));
    this.stderr().write(string + "\n");
  },
  exit: function() {
    var code = arguments[0] !== (void 0) ? arguments[0] : 0;
    setTimeout((function() {
      process.emit("azk:command:exit", code);
    }), 500);
  },
  newMultiBars: function() {
    mbars.push(new Multibar());
    return mbars.length - 1;
  },
  newBar: function(mbar) {
    var $__15;
    for (var args = [],
        $__10 = 1; $__10 < arguments.length; $__10++)
      args[$__10 - 1] = arguments[$__10];
    return ($__15 = mbars[mbar]).newBar.apply($__15, $traceurRuntime.toObject(args));
  },
  stdout: function() {
    return process.stdout;
  },
  stderr: function() {
    return process.stderr;
  },
  stdin: function() {
    return process.stdin;
  },
  table_add: function(name, options) {
    tables[name] = new Table(options);
    return name;
  },
  table_push: function(name) {
    var $__15;
    for (var args = [],
        $__11 = 1; $__11 < arguments.length; $__11++)
      args[$__11 - 1] = arguments[$__11];
    ($__15 = tables[name]).push.apply($__15, $traceurRuntime.toObject(args));
  },
  table_show: function(name) {
    this.output(tables[name].toString());
  },
  execSh: function() {
    var $__15;
    for (var args = [],
        $__12 = 0; $__12 < arguments.length; $__12++)
      args[$__12] = arguments[$__12];
    var result = (function(err) {
      return (err) ? err.code : 0;
    });
    return ($__15 = Q).nfcall.apply($__15, $traceurRuntime.spread([execSh], args)).spread(result, result);
  },
  prompt: function(questions) {
    if (_.isObject(questions))
      questions = [questions];
    questions = _.map(questions, (function(q) {
      if (!_.isEmpty(q.message)) {
        q.message = t(q.message);
      }
      return q;
    }));
    return defer((function(resolve) {
      inquirer.prompt(questions, (function(answers) {
        return resolve(answers);
      }));
    }));
  }
};
;
var UIProxy = function UIProxy(ui) {
  if (ui.isUI) {
    this.__user_interface = ui;
  } else {
    this.parent = ui;
  }
};
($traceurRuntime.createClass)(UIProxy, {
  set userInterface(ui) {
    this.__user_interface = ui;
  },
  get userInterface() {
    return this.parent ? this.parent.userInterface : this.__user_interface;
  }
}, {});
_.each(_.methods(UI), (function(method) {
  UIProxy.prototype[method] = function() {
    var $__15;
    for (var args = [],
        $__13 = 0; $__13 < arguments.length; $__13++)
      args[$__13] = arguments[$__13];
    return ($__15 = this.userInterface)[method].apply($__15, $traceurRuntime.toObject(args));
  };
}));
module.exports = {
  get UI() {
    return UI;
  },
  get UIProxy() {
    return UIProxy;
  },
  __esModule: true
};
//# sourceMappingURL=ui.js.map