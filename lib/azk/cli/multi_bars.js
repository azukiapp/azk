"use strict";
var __moduleName = "src/cli/multi_bars";
var ProgressBar = require('progress');
var Multibar = function Multibar() {
  var stream = arguments[0] !== (void 0) ? arguments[0] : process.stderr;
  this.stream = stream || process.stderr;
  this.cursor = 0;
  this.bars = [];
  this.terminates = 0;
};
($traceurRuntime.createClass)(Multibar, {
  newBar: function(schema) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    var $__0 = this;
    options.stream = this.stream;
    var bar = new ProgressBar(schema, options);
    var index = this.bars.length;
    this.bars.push(bar);
    this.move(index);
    this.stream.write('\n');
    this.cursor++;
    bar.otick = bar.tick;
    bar.tick = (function() {
      var $__3;
      for (var args = [],
          $__2 = 0; $__2 < arguments.length; $__2++)
        args[$__2] = arguments[$__2];
      return ($__3 = $__0).tick.apply($__3, $traceurRuntime.spread([index], args));
    });
    bar.terminate = (function(message) {
      $__0.terminates++;
      if (message) {
        $__0.clear(index);
        $__0.stream.write(message);
      }
      if ($__0.terminates == $__0.bars.length) {
        $__0.terminate();
      }
    });
    return bar;
  },
  clear: function(index) {
    if (!this.stream.isTTY)
      return;
    this.move(index);
    this.stream.clearLine();
    this.stream.cursorTo(0);
  },
  terminate: function() {
    this.clear(this.bars.length);
  },
  move: function(index) {
    if (!this.stream.isTTY)
      return;
    this.stream.moveCursor(0, index - this.cursor);
    this.cursor = index;
  },
  tick: function(index, value, options) {
    var bar = this.bars[index];
    if (bar) {
      this.move(index);
      bar.otick(value, options);
    }
  }
}, {});
module.exports = {
  get Multibar() {
    return Multibar;
  },
  __esModule: true
};
//# sourceMappingURL=multi_bars.js.map