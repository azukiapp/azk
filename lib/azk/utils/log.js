"use strict";
var __moduleName = "src/utils/log";
var $__1 = require('azk'),
    _ = $__1._,
    config = $__1.config,
    t = $__1.t;
var winston = require('winston');
var log = new winston.Logger();
log.add(winston.transports.File, {
  filename: config('paths:log'),
  level: 'debug',
  colorize: true,
  json: false
});
var console_opts = {
  handleExceptions: true,
  colorize: true,
  level: config('logs_level:console')
};
if (config('env') != 'test') {
  log.add(winston.transports.Console, console_opts);
}
_.each(winston.levels, (function(__, method) {
  log[(method + "_t")] = function() {
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    return this[method](t.apply(null, $traceurRuntime.toObject(args)));
  };
}));
log.setConsoleLevel = (function(level) {
  log.remove(winston.transports.Console);
  console_opts.level = level;
  log.add(winston.transports.Console, console_opts);
});
;
module.exports = {
  get log() {
    return log;
  },
  __esModule: true
};
//# sourceMappingURL=log.js.map