import { _, Q, t, defer } from 'azk';
import { Multibar } from 'azk/cli/multi_bars';

require('colors');

var execSh   = require('exec-sh');
var Table    = require('cli-table');
var printf   = require('printf');
var inquirer = require('inquirer');
var mbars    = [];
var tables   = {};

// Status labels
var ok        = 'azk'.green;
var fail      = 'azk'.red;
var warning   = 'azk'.yellow;
var info      = 'azk'.blue;
var deprecate = 'azk'.cyan;

var UI = {
  isUI: true,
  t: t,

  dir(...args) {
    console.dir(...args);
  },

  output(string, ...args) {
    this.stdout().write(printf(string || "", ...args) + "\n");
  },

  tOutput(...args) {
    this.stdout().write(t(...args) + "\n");
  },

  outputWithLabel(rows, ident = '') {
    rows = _.map(rows, (row) => {
      return _.isArray(row) ? row : row.split('\t');
    });

    var size = _.reduce(rows, (acc, row) => {
      return acc > row[0].length ? acc : row[0].length;
    }, 0);

    _.each(rows, (row) => {
      this.output("%s%-*s  %s", ident, row.shift(), size, ...row);
    });
  },

  // Helpers to print status
  ok(...args)        { this._status(ok, ...args);      },
  info(...args)      { this._status(info, ...args);    },
  fail(...args)      { this._status(fail, ...args);    },
  warning(...args)   { this._status(warning, ...args); },
  deprecate(...args) { this._status(deprecate, ...args); },
  _status(tag, ...args) {
    var string = t(...args).replace(/^(.+)/gm, `${tag}: $1`);
    this.stderr().write(string + "\n");
  },

  // TOOD: Flush log (https://github.com/flatiron/winston/issues/228)
  exit(code = 0) {
    setTimeout(() => {
      process.emit("azk:command:exit", code);
    }, 500);
  },

  newMultiBars() {
    mbars.push(new Multibar());
    return mbars.length - 1;
  },

  newBar(mbar, ...args) {
    return mbars[mbar].newBar(...args);
  },

  stdout() {
    return process.stdout;
  },

  stderr() {
    return process.stderr;
  },

  stdin() {
    return process.stdin;
  },

  table_add(name, options) {
    tables[name] = new Table(options);
    return name;
  },

  table_push(name, ...args) {
    tables[name].push(...args);
  },

  table_show(name) {
    this.output(tables[name].toString());
  },

  // User interactions methods
  execSh(...args) {
    var result = (err) => { return (err) ? err.code : 0; }
    return Q.nfcall(execSh, ...args).spread(result, result);
  },

  prompt(questions) {
    // Object or array support
    if (_.isObject(questions)) questions = [questions];

    questions = _.map(questions, (q) => {
      if (!_.isEmpty(q.message)) {
        q.message = t(q.message);
      }
      return q;
    });

    return defer((resolve) => {
      inquirer.prompt(questions, (answers) => resolve(answers));
    });
  }
}

export { UI };

export class UIProxy {
  constructor(ui) {
    if (ui.isUI) {
      this.__user_interface = ui;
    } else {
      this.parent = ui;
    }
  }

  set userInterface(ui) {
    this.__user_interface = ui;
  }

  // Outputs and debugs
  get userInterface() {
    return this.parent ? this.parent.userInterface : this.__user_interface;
  }
}

_.each(_.methods(UI), (method) => {
  UIProxy.prototype[method] = function(...args) {
    return this.userInterface[method](...args);
  }
});
