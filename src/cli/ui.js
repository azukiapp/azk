import { _, t } from 'azk';
require('colors');

var ok = 'azk'.green;
var fail = 'azk'.red;

var UI = {
  isUI: true,

  dir(...args) {
    console.dir(...args);
  },

  tOutput(...args) {
    console.log(t(...args));
  },

  ok(...args) {
    console.log(ok + ": " + t(...args));
  },

  fail(...args) {
    console.log(fail + ": " + t(...args));
  },

  exit(code = 0) {
    process.emit("azk:command:exit", code);
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

  // Outputs and debugs
  get userInterface() {
    return this.parent ? this.parent.userInterface : this.__user_interface;
  }
}

_.each(_.methods(UI), (method) => {
  UIProxy.prototype[method] = function(...args) {
    this.userInterface[method](...args);
  }
});
