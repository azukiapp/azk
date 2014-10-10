import { _, envs, mergeConfig } from 'azk/utils';
var path = require('path');
var os   = require('os');

// Configs paths
var azk_root  = envs('AZK_ROOT_PATH');
var data_path = envs('AZK_DATA_PATH');

// Namespace to support multiple instances of the agent
var namespace = envs('AZK_NAMESPACE');

// Use virtual machine or not?
var default_vm  = os.platform() == "linux" ? "false" : "true";
var requires_vm = (envs('AZK_USE_VM', default_vm) == "true");

// Persistent folder path
var persistent_folders = requires_vm ?
  '/mnt/sda1/azk/persistent_folders' :
  path.join(data_path, 'persistent_folders');

// Paths to use in config
var paths = {
  logs: path.join(data_path, 'logs'),
  run : path.join(data_path, 'run'),
  vm  : path.join(data_path, 'vm'),
};

var options = mergeConfig({
  '*': {
    namespace: namespace,
    manifest : "Azkfile.js",
    locale   : 'en-US',
    azk_dir  : ".azk",
    flags    : { show_deprecate: true, },
    paths    : {
      azk_root,
      data: data_path,
      logs: paths.logs,
      log : path.join(paths.logs, 'azk.log'),

      agent_pid         : path.join(paths.run, 'agent.pid'),
      unfsd_pid         : path.join(paths.run, 'unfsd.pid'),
      memcached_pid     : path.join(paths.run, 'memcachedjs.pid'),
      hipache_pid       : path.join(paths.run, 'hipache.pid'),
      agent_socket      : path.join(paths.run, 'agent.socket'),
      unfsd_file        : path.join(paths.run, 'exports'),
      balancer_file     : path.join(paths.run, 'hipache.json'),
      memcached_socket  : path.join(paths.run, 'memcachedjs.socket'),
      persistent_folders: persistent_folders,
    },
    logs_level: {
      console: (envs('AZK_DEBUG') ? 'debug' : 'warn'),
      file: envs('AZK_LOG_LEVEL', 'info'),
    },
    docker: {
      //host          : docker_host,
      namespace     : envs('AZK_NAMESPACE'),
      repository    : 'azk',
      default_domain: 'azk',
      image_default : 'azukiapp/azktcl:0.0.2',
      run: {
        timeout: 1000,
        retry: 10,
      }
    },
    agent: {
      requires_vm: requires_vm,
      portrange_start: 11000,
      balancer: {
        host: envs('AZK_BALANCER_HOST'),
        port: envs('AZK_BALANCER_PORT', 80),
        file_dns: "/etc/resolver/" + envs('AZK_BALANCER_HOST'),
      },
      //dns: {
        //ip         : vm_ip,
      //},
      vm: {
        //ip         : vm_ip,
        name       : envs('AZK_AGENT_VM_NAME', "azk-vm-" + namespace),
        user       : "docker",
        password   : "tcuser",
        cpus       : envs('AZK_VM_CPUS', os.cpus().length),
        memory     : envs('AZK_VM_MEMORY', Math.floor(os.totalmem()/1024/1024/4)),
        ssh_key    : envs('AZK_AGENT_VM_KEY'),
        boot_disk  : envs('AZK_BOOT_FILE'),
        data_disk  : path.join(env('AZK_LIB_PATH'), "vm", "azk-agent.vmdk"),
        blank_disk : path.join(env('AZK_LIB_PATH'), "vm", "azk-agent.vmdk.bz"),
        mount_point: '/home/docker/files',
        authorized_key: '/home/docker/.ssh/authorized_keys',
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
      portrange_start: 12000,
      vm: {
        data_disk : path.join(data_path, "vm", "azk-agent-spec.vmdk"),
      }
    }
  }
});

function env() {
  return envs('NODE_ENV', 'production');
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

