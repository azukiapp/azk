
var p = require('path');

DEFAULT_FILE_PATH = p.resolve(process.env.HOME, '.azk', 'data');
DEFAULT_PID_PATH  = p.join(DEFAULT_FILE_PATH, 'pids');
DEFAULT_LOG_PATH  = p.join(DEFAULT_FILE_PATH, 'logs');

var default_conf = {
  MANIFEST           : "azkfile.json",

  DEFAULT_FILE_PATH   : DEFAULT_FILE_PATH,
  AZK_LOG_FILE_PATH   : p.join(DEFAULT_LOG_PATH , 'azk.log'),
  AZK_PID_FILE_PATH   : p.join(DEFAULT_PID_PATH , 'azk.pid'),
  DEFAULT_PID_PATH    : DEFAULT_PID_PATH,
  DEFAULT_LOG_PATH    : DEFAULT_LOG_PATH,

  DAEMON_BIND_HOST    : process.env.AZK_BIND_ADDR || 'localhost',
  DAEMON_RPC_PORT     : parseInt(process.env.AZK_RPC_PORT)  || 5640, // RPC commands
  DAEMON_PUB_PORT     : parseInt(process.env.AZK_PUB_PORT)  || 5639, // Realtime events

  AZK_AGENT           : process.env.AZK_AGENT || false,
  AZK_AGENT_MOUNT     : "/home/docker/.azk/data/all",

  DEBUG               : process.env.AZK_DEBUG || false,
  PREFIX_MSG          : '\x1B[32mAZK \x1B[39m',
  PREFIX_MSG_ERR      : '\x1B[31mAZK [ERROR] \x1B[39m',

  SUCCESS_EXIT        : 0,
  ERROR_EXIT          : 1,

  DOCKER_HOST         : process.env.DOCKER_HOST || "http://127.0.0.1:5642"
}

module.exports = default_conf;
