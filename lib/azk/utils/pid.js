"use strict";
var __moduleName = "src/utils/pid";
var $__1 = require('azk'),
    fs = $__1.fs,
    path = $__1.path,
    defer = $__1.defer;
var Pid = function Pid(file) {
  this.file = file;
  this.pid = null;
  if (fs.existsSync(file)) {
    this.pid = parseInt(fs.readFileSync(file).toString());
  }
};
($traceurRuntime.createClass)(Pid, {
  get running() {
    if (this.pid) {
      try {
        process.kill(this.pid, 0);
        return true;
      } catch (_) {}
    }
    return false;
  },
  update: function() {
    var pid = arguments[0] !== (void 0) ? arguments[0] : null;
    this.pid = pid || this.pid;
    if (this.running) {
      fs.writeFileSync(this.file, this.pid);
    } else {
      this.unlink();
    }
  },
  unlink: function() {
    if (fs.existsSync(this.file)) {
      fs.unlinkSync(this.file);
      this.pid = null;
    }
  },
  term: function() {
    if (this.running) {
      process.kill(this.pid, 'SIGTERM');
    }
    this.pid = null;
    this.update();
  }
}, {});
module.exports = {
  get Pid() {
    return Pid;
  },
  __esModule: true
};
//# sourceMappingURL=pid.js.map