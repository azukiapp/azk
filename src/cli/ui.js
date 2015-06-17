import { _, t, lazy_require } from 'azk';
import { defer, nfcall } from 'azk/utils/promises';
import { AzkError } from 'azk/utils/errors';

require('colors');

var lazy = lazy_require({
  'Table'    : 'cli-table',
  'printf'   : 'printf',
  'inquirer' : 'inquirer',
  'execShLib': 'exec-sh',
});

var tables    = {};

// Status labels
var azk_ok        = 'azk'.green;
var azk_fail      = 'azk'.red;
var azk_warning   = 'azk'.yellow;
var azk_info      = 'azk'.blue;
var azk_deprecate = 'azk'.cyan;

var UI = {
  isUI: true,
  t: t,

  dir(...args) {
    console.dir(...args);
  },

  output(string, ...args) {
    this.stdout().write(lazy.printf(string || "", ...args) + "\n");
  },

  tOutput(...args) {
    this.stdout().write(t(...args) + "\n");
  },

  tKeyPath(...keys) {
    return ['commands', ...keys];
  },

  outputWithLabel(rows, ident = '') {
    rows = _.map(_.sortBy(rows), (row) => {
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
  ok(...args) {        this._status(azk_ok, ...args);      },
  info(...args) {      this._status(azk_info, ...args);    },
  fail(...args) {      this._status(azk_fail, ...args);    },
  warning(...args) {   this._status(azk_warning, ...args); },
  deprecate(...args) { this._status(azk_deprecate, ...args); },

  _status(tag, second, ...args) {
    var message;

    if (second instanceof Error) {
      if (second instanceof AzkError) {
        message = second.toString();
      } else {
        message = second.stack ? second.stack : second.toString();
      }
    } else {
      message = t(second, ...args);
    }

    message = message.replace(/^(.+)/gm, `${tag}: $1`);
    this.stderr().write(message + "\n");
  },

  // TOOD: Flush log (https://github.com/flatiron/winston/issues/228)
  exit(code = 0) {
    require('azk/utils/postal').unsubscribeAll();
    setTimeout(() => {
      process.emit("azk:command:exit", code);
    }, 500);
  },

  createProgressBar(...args) {
    var ProgressBar = require('progress');
    return new ProgressBar(...args);
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
    options = options || {};

    if (options.text) {
      options.chars = {
        'top'           : '', 'top-mid'       : '', 'top-left'    : '',
        'top-right'     : '', 'bottom'        : '', 'bottom-mid'  : '',
        'bottom-left'   : '', 'bottom-right'  : '', 'left'        : '',
        'left-mid'      : '', 'mid'           : '', 'mid-mid'     : '',
        'right'         : '', 'right-mid'     : '', 'middle'      : ''
      };

      delete(options.text);
    }

    tables[name] = new lazy.Table(options);
    return name;
  },

  table_push(name, ...args) {
    tables[name].push(...args);
  },

  table(name) {
    return tables[name];
  },

  table_show(name) {
    this.output(tables[name].toString());
  },

  // User interactions methods
  execSh(command, options = {}, callback = null) {
    if (_.isFunction(options)) {
      [callback, options] = [options, {}];
    }

    if (callback) {
      return lazy.execShLib(command, options, callback);
    } else {
      var result = (err) => { return (err) ? err.code : 0; };
      return nfcall(lazy.execShLib, command, options).spread(result, result);
    }
  },

  prompt(questions) {
    // Object or array support
    if (_.isObject(questions)) {
      questions = [questions];
    }

    questions = _.map(questions, (q) => {
      if (!_.isEmpty(q.message)) {
        q.message = t(q.message);
      }
      return q;
    });

    return defer((resolve) => {
      lazy.inquirer.prompt(questions, (answers) => resolve(answers));
    });
  },

  isInteractive() {
    return this.stdout().isTTY === true;
  },

  outputColumns() {
    return this.isInteractive() ? this.stdout().columns : -1;
  },
};

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
  };
});
