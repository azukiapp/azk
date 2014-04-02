
import Utils from 'azk/utils';
import { join } from 'path';

function get_env(key, def_value) {
  return process.env[key] || def_value;
}

var DATA_PATH = get_env(
  'AZK_DATA_PATH',
  Utils.resolve(process.env.HOME, '.azk', 'data')
);
var PIDS_PATH  = join(DATA_PATH, 'pids');
var LOGS_PATH  = join(DATA_PATH, 'logs');

var default_conf = {
  MANIFEST            : "Azkfile.js",
  DEFAULT_DOMAIN      : "dev.azk.io",
  AZK_ROOT_PATH       : __dirname,

  DATA_PATH           : DATA_PATH,
  LOG_FILE_PATH       : join(PIDS_PATH , 'azk.log'),
  PID_FILE_PATH       : join(LOGS_PATH , 'azk.pid'),
  PIDS_PATH           : PIDS_PATH,
  LOGS_PATH           : LOGS_PATH,

  DAEMON_BIND_HOST    : process.env.AZK_BIND_ADDR || 'localhost',
  DAEMON_PROXY_PORT   : parseInt(get_env('AZK_PROXY_PORT', 15680)), // RPC commands
  DAEMON_RPC_PORT     : parseInt(get_env('AZK_RPC_PORT'  , 5640 )), // RPC commands
  DAEMON_PUB_PORT     : parseInt(get_env('AZK_PUB_PORT'  , 5639 )), // Realtime events

  AZK_AGENT           : get_env('AZK_AGENT', false),
  AZK_AGENT_MOUNT     : "/home/docker/.azk/data/files",

  DEBUG               : get_env('AZK_DEBUG', false),
  PREFIX_MSG          : '\x1B[32mAZK \x1B[39m',
  PREFIX_MSG_ERR      : '\x1B[31mAZK [ERROR] \x1B[39m',

  SPFS_PORT           : 5641,
  SPFS_IP             : null,

  VM_NAME             : 'azk-agent',
  VM_SSH_MAP_PORT     : 5622,
  VM_USER             : "docker",
  VM_BLANK_DISK       : join(DATA_PATH, "vm", "azk-agent.vmdk.bz"),
  VM_BOOT_DISK        : join(DATA_PATH, "vm", "debian2docker.iso"),
  VM_DATA_DISK        : join(DATA_PATH, "vm", "azk-agent.vmdk"),
  VM_KEY              : join(__dirname, "lib", "share", "id_rsa_insecure"),

  SUCCESS_EXIT        : 0,
  ERROR_EXIT          : 1,

  DOCKER_NS_NAME      : 'azk',
  DOCKER_DEFAULT_IMG  : "racker/precise-with-updates:latest",
  DOCKER_HOST         : get_env('AZK_DOCKER_HOST', "http://azk-agent:4243"),
}

export function get(key) {
  return default_conf[key];
}
