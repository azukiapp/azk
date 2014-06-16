import { _ } from 'azk/utils';
var path    = require('path');
var dnsSync = require('dns-sync');

// Root path
var azk_root =
  process.env.AZK_ROOT_PATH ||
  path.join('..', '..');

var data_path =
  process.env.AZK_DATA_PATH ||
  path.join(process.env.HOME, '.azk', 'data');

// Use virtual machine
var requires_vm = (process.env.AZK_USE_VM == "true");

// Vm informations
// TODO: Show erro if not resolve ip
var vm_name = process.env.AZK_AGENT_VM_NAME || "azk-agent";
var vm_ip   = process.env.AZK_AGENT_VM_IP || dnsSync.resolve(vm_name);

// Balancer configuration
var balancer = {
    ip: process.env.AZK_BALANCER_IP   || vm_ip,
  host: process.env.AZK_BALANCER_HOST,
  port: process.env.AZK_BALANCER_PORT || 80,
  file_dns: "/etc/resolver/" + process.env.AZK_BALANCER_HOST,
};

// Docker opts
var docker_host =
  process.env.AZK_DOCKER_HOST ||
  (requires_vm ? "http://" + vm_ip + ":2375" : "unix:///var/run/docker.sock");

// Log level
var log_level = process.env.AZK_DEBUG ? 'debug' : 'warn';

function merge(options) {
  _.each(options, (values, key) => {
    if (key != '*')
      options[key] = _.merge({}, options['*'], values);
  });
  return options;
}

var options = merge({
  '*': {
    manifest: "Azkfile.js",
    locale  : 'en-US',
    azk_dir : ".azk",
    paths   : {
      azk_root,
      data  : data_path,
      log   : path.join(data_path, 'logs', 'azk.log'),

      persistent_folders: path.join(data_path, 'persistent_folders'),

      agent_pid: path.join(data_path, 'run', 'agent.pid'),
      unfsd_pid: path.join(data_path, 'run', 'unfsd.pid'),
      memcached_pid: path.join(data_path, 'run', 'memcachedjs.pid'),
      hipache_pid: path.join(data_path, 'run', 'hipache.pid'),

      agent_socket : path.join(data_path, 'run', 'agent.socket'),
      memcached_socket : path.join(data_path, 'run', 'memcachedjs.socket'),
      unfsd_file   : path.join(data_path, 'run', 'exports'),
      balancer_file: path.join(data_path, 'run', 'hipache.json'),

      unfsd: process.env.AZK_UNFSD_PATH,
    },
    logs_level: {
      console: (process.env.AZK_DEBUG ? 'debug' : 'warn'),
      file: process.env.AZK_LOG_LEVEL || 'info',
    },
    docker  : {
      host          : docker_host,
      namespace     : 'azk',
      repository    : 'azk',
      default_domain: 'azk',
      image_default : 'azukiapp/azktcl:0.0.1',
    },
    agent: {
      requires_vm: requires_vm,
      portrange_start: 11000,
      balancer,
      dns: {
        ip         : vm_ip,
      },
      vm: {
        ip         : vm_ip,
        name       : vm_name,
        user       : "docker",
        password   : "tcuser",
        boot_disk  : process.env.AZK_BOOT_FILE,
        data_disk  : path.join(data_path, "vm", "azk-agent.vmdk"),
        blank_disk : path.join(data_path, "vm", "azk-agent.vmdk.bz"),
        mount_point: '/home/docker/files',
        persistent_folders: '/mnt/sda1/azk/persistent_folders',
      }
    }
  },
  test: {
    paths: {
      log: path.join(data_path, 'logs', 'azk_test.log'),
    },
    docker: {
      namespace   : 'azk.test',
      repository  : 'azk-test',
      image_empty : 'cevich/empty_base_image',
    },
    agent: {
      vm: {
        data_disk : path.join(data_path, "vm", "azk-agent-spec.vmdk"),
      }
    }
  }
});

function env() {
  return process.env.NODE_ENV || 'production';
}

export function get(key) {
  if (key == "env") return env();

  var keys   = key.split(':');
  var buffer = options[env()] || options['*'];

  for(var i = 0; i < keys.length; i++) {
    buffer = buffer[keys[i]];
    if (!buffer) break;
  }

  return buffer;
};

export function set(key, value) {
  if (key == "env") {
    process.env.NODE_ENV = value;
  } else {
    var keys   = [env(), ...key.split(':')];
    var buffer = { [keys.pop()]: value };
    while(key  = keys.pop()) { buffer = { [key]: buffer } };

    // Check env exist
    if (!options[env()]) {
      options[env()] = _.cloneDeep(options['*']);
    }

    _.merge(options, buffer);
  }
  return value;
}
