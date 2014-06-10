import { _, t } from 'azk';
import { Multibar } from 'azk/cli/multi_bars';
require('colors');

var Table  = require('cli-table');
var printf = require('printf');
var ok     = 'azk'.green;
var fail   = 'azk'.red;
var mbars  = [];
var tables = {};

var UI = {
  isUI: true,

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

  ok(...args) {
    console.log(ok + ": " + t(...args));
  },

  fail(...args) {
    console.log(fail + ": " + t(...args));
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
