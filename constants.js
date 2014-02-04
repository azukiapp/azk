
var p    = require('path');


DEFAULT_FILE_PATH = p.resolve(process.env.HOME, '.azk');

var default_conf = {
  MANIFEST           : "azkfile.json",

  DEFAULT_FILE_PATH  : DEFAULT_FILE_PATH,
  AZK_LOG_FILE_PATH  : p.join(p.resolve(process.env.HOME, '.azk'), 'azk.log'),
  AZK_PID_FILE_PATH  : p.join(p.resolve(process.env.HOME, '.azk'), 'azk.pid'),
  DEFAULT_PID_PATH   : p.join(DEFAULT_FILE_PATH, 'pids'),
  DEFAULT_LOG_PATH   : p.join(DEFAULT_FILE_PATH, 'logs'),

  DEBUG              : process.env.AZK_DEBUG || false,
  PREFIX_MSG         : '\x1B[32mAZK \x1B[39m',
  PREFIX_MSG_ERR     : '\x1B[31mAZK [ERROR] \x1B[39m',

  SUCCESS_EXIT       : 0,
  ERROR_EXIT         : 1,

  DOCKER_HOST        : process.env.DOCKER_HOST || "http://127.0.0.42:4243"
}

module.exports = default_conf;
