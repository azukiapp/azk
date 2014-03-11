
var p = require('path');
var utils = require('./lib/utils');

DEFAULT_DATA_PATH = utils.resolve(p.join(process.env.HOME, '.azk', 'data'));
DEFAULT_PID_PATH  = p.join(DEFAULT_DATA_PATH, 'pids');
DEFAULT_LOG_PATH  = p.join(DEFAULT_DATA_PATH, 'logs');

var default_conf = {
  MANIFEST            : "azkfile.json",
  AZK_ROOT_PATH       : __dirname,

  DEFAULT_DATA_PATH   : DEFAULT_DATA_PATH,
  AZK_CLONE_PATH      : p.join(DEFAULT_DATA_PATH, 'boxes'),
  AZK_LOG_FILE_PATH   : p.join(DEFAULT_LOG_PATH , 'azk.log'),
  AZK_PID_FILE_PATH   : p.join(DEFAULT_PID_PATH , 'azk.pid'),
  DEFAULT_PID_PATH    : DEFAULT_PID_PATH,
  DEFAULT_LOG_PATH    : DEFAULT_LOG_PATH,

  DAEMON_BIND_HOST    : process.env.AZK_BIND_ADDR || 'localhost',
  DAEMON_RPC_PORT     : parseInt(process.env.AZK_RPC_PORT)  || 5640, // RPC commands
  DAEMON_PUB_PORT     : parseInt(process.env.AZK_PUB_PORT)  || 5639, // Realtime events

  AZK_AGENT           : process.env.AZK_AGENT || false,
  AZK_AGENT_MOUNT     : "/home/docker/.azk/data/files",

  DEBUG               : process.env.AZK_DEBUG || false,
  PREFIX_MSG          : '\x1B[32mAZK \x1B[39m',
  PREFIX_MSG_ERR      : '\x1B[31mAZK [ERROR] \x1B[39m',

  SPFS_PORT           : 5641,
  SPFS_IP             : null,

  VM_NAME             : 'azk-agent',
  VM_SSH_MAP_PORT     : 5622,
  VM_USER             : "docker",
  VM_BLANK_DISK       : p.join(DEFAULT_DATA_PATH, "vm", "azk-agent.vmdk.bz"),
  VM_BOOT_DISK        : p.join(DEFAULT_DATA_PATH, "vm", "debian2docker.iso"),
  VM_DATA_DISK        : p.join(DEFAULT_DATA_PATH, "vm", "azk-agent.vmdk"),
  VM_KEY              : p.join(__dirname, "lib", "share", "id_rsa_insecure"),

  SUCCESS_EXIT        : 0,
  ERROR_EXIT          : 1,

  DOCKER_NS_NAME      : 'azk',
  DOCKER_DEFAULT_IMG  : "racker/precise-with-updates:latest",
  DOCKER_HOST         : process.env.DOCKER_HOST || "http://azk-agent:4243"
}

module.exports = default_conf;
