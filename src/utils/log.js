import { _, config, t } from 'azk';
var winston = require('winston');

var log = new winston.Logger();
var sysUtil = require("util");

// File log
log.add(winston.transports.File, {
  filename: config('paths:log'),
  level: config('logs_level:file'),
  colorize: true,
  prettyPrint: true,
  json: false,
});

// Console log
var console_opts = {
  handleExceptions: true,
  colorize: true,
  prettyPrint: true,
  level: config('logs_level:console')
}
if (config('env') != 'test') {
  log.add(winston.transports.Console, console_opts);
}

_.each(winston.levels, (__, method) => {
  log[`${method}_t`] = function(...args) {
    return this[method](t(...args));
  }
});

log.setConsoleLevel = (level) => {
  log.remove(winston.transports.Console);
  console_opts.level = level;
  log.add(winston.transports.Console, console_opts);
};

export { log };
