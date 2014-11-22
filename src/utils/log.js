import { _, config, t } from 'azk';
var winston = require('winston');

var log = new winston.Logger();
var sysUtil = require("util");

// File log
log.add(winston.transports.File, {
  filename: config('paths:log'),
  level: config('logs_level:file'),
  colorize: true,
  json: false,
});

// Console log
var console_opts = {
  handleExceptions: true,
  colorize: true,
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

var repeateString = function(char, size) {
  var acc = '';
  for(var i = 0; i <= size; i++) {
    acc = acc + char;
  }
  return acc;
};

log.inspectThis = (title, targetToInspect, depth) => {
  var inspectResult = sysUtil.inspect(targetToInspect, {
    showHidden: true,
    colors    : true,
    depth     : depth || 2
  });
  var titleSize = title.length;
  var separator = repeateString('-', titleSize);
  log.debug(separator);
  log.debug(title);
  log.debug(separator + '\n' + inspectResult + '\n');
  log.debug(' ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^');
};



export { log };
