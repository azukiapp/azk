"use strict";
var __moduleName = "src/config";
var $__3 = require('azk/utils'),
    _ = $__3._,
    envs = $__3.envs,
    mergeConfig = $__3.mergeConfig;
var path = require('path');
var os = require('os');
var azk_root = envs('AZK_ROOT_PATH');
var data_path = envs('AZK_DATA_PATH');
var namespace = envs('AZK_NAMESPACE');
var default_vm = os.platform() == "linux" ? "false" : "true";
var requires_vm = (envs('AZK_USE_VM', default_vm) == "true");
var persistent_folders = requires_vm ? '/mnt/sda1/azk/persistent_folders' : path.join(data_path, 'persistent_folders');
var paths = {
  logs: path.join(data_path, 'logs'),
  run: path.join(data_path, 'run'),
  vm: path.join(data_path, 'vm')
};
var dns_nameservers = function(key, defaultValue) {
  var value = envs(key);
  return _.isEmpty(value) ? defaultValue : _.invoke(value.split(','), 'trim');
};
var Dynamic = function Dynamic(key) {
  this.key = key;
};
($traceurRuntime.createClass)(Dynamic, {}, {});
var options = mergeConfig({
  '*': {
    namespace: namespace,
    manifest: "Azkfile.js",
    locale: 'en-US',
    azk_dir: ".azk",
    flags: {show_deprecate: true},
    paths: {
      azk_root: azk_root,
      data: data_path,
      logs: paths.logs,
      log: path.join(paths.logs, 'azk.log'),
      agent_pid: path.join(paths.run, 'agent.pid'),
      unfsd_pid: path.join(paths.run, 'unfsd.pid'),
      memcached_pid: path.join(paths.run, 'memcachedjs.pid'),
      hipache_pid: path.join(paths.run, 'hipache.pid'),
      agent_socket: path.join(paths.run, 'agent.socket'),
      unfsd_file: path.join(paths.run, 'exports'),
      balancer_file: path.join(paths.run, 'hipache.json'),
      memcached_socket: path.join(paths.run, 'memcachedjs.socket'),
      api_socket: path.join(paths.run, 'api.socket'),
      persistent_folders: persistent_folders
    },
    logs_level: {
      console: (envs('AZK_DEBUG') ? 'debug' : 'warn'),
      file: envs('AZK_LOG_LEVEL', 'info')
    },
    docker: {
      socket: envs('AZK_DOCKER_SOCKER', "/var/run/docker.sock"),
      host: new Dynamic("docker:host"),
      namespace: envs('AZK_NAMESPACE'),
      repository: 'azk',
      default_domain: 'azk',
      image_default: 'azukiapp/azktcl:0.0.2',
      run: {
        timeout: 1000,
        retry: 10
      }
    },
    agent: {
      requires_vm: requires_vm,
      portrange_start: 11000,
      balancer: {
        ip: new Dynamic("agent:balancer:ip"),
        host: envs('AZK_BALANCER_HOST'),
        port: envs('AZK_BALANCER_PORT', 80),
        file_dns: "/etc/resolver/" + envs('AZK_BALANCER_HOST')
      },
      dns: {
        ip: new Dynamic("agent:dns:ip"),
        port: envs('AZK_DNS_PORT', '53'),
        nameservers: dns_nameservers('AZK_DNS_SERVERS', []),
        defaultserver: dns_nameservers('AZK_DNS_SERVERS_DEFAULTS', ['8.8.8.8', '8.8.4.4'])
      },
      vm: {
        ip: envs('AZK_AGENT_VM_IP', '192.168.50.4'),
        name: envs('AZK_AGENT_VM_NAME', "azk-vm-" + namespace),
        user: "docker",
        password: "tcuser",
        cpus: envs('AZK_VM_CPUS', os.cpus().length),
        memory: envs('AZK_VM_MEMORY', Math.floor(os.totalmem() / 1024 / 1024 / 4)),
        ssh_key: envs('AZK_AGENT_VM_KEY', path.join(paths.vm, "azkvm_rsa")),
        data_disk: path.join(paths.vm, "azk-agent.vmdk"),
        boot_disk: path.join(envs('AZK_LIB_PATH'), "vm", "azk.iso"),
        blank_disk: path.join(envs('AZK_LIB_PATH'), "vm", "azk-agent.vmdk.gz"),
        mount_point: '/home/docker/files',
        authorized_key: '/home/docker/.ssh/authorized_keys'
      },
      config_keys: []
    }
  },
  test: {
    paths: {log: path.join(paths.logs, 'azk_test.log')},
    docker: {
      namespace: 'azk.test',
      repository: 'azk-test',
      image_empty: 'cevich/empty_base_image'
    },
    agent: {
      portrange_start: 12000,
      vm: {data_disk: path.join(paths.vm, "azk-agent-spec.vmdk")}
    }
  }
});
function env() {
  var env = envs('NODE_ENV', 'production');
  return env;
}
function get(key) {
  if (key == "env")
    return env();
  var keys = key.split(':');
  var buffer = options[env()] || options['*'];
  for (var i = 0; i < keys.length; i++) {
    buffer = buffer[keys[i]];
    if (!buffer)
      break;
  }
  if (buffer instanceof Dynamic) {
    throw new Error(("Config " + buffer.key + " to be set by configure"));
  }
  return _.clone(buffer);
}
;
function set(key, value) {
  var $__1,
      $__2;
  if (key == "env") {
    process.env.NODE_ENV = value;
  } else {
    var keys = $traceurRuntime.spread([env()], key.split(':'));
    var buffer = ($__1 = {}, Object.defineProperty($__1, keys.pop(), {
      value: value,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__1);
    while (key = keys.pop()) {
      buffer = ($__2 = {}, Object.defineProperty($__2, key, {
        value: buffer,
        configurable: true,
        enumerable: true,
        writable: true
      }), $__2);
    }
    ;
    if (!options[env()]) {
      options[env()] = _.cloneDeep(options['*']);
    }
    _.merge(options, buffer);
  }
  return value;
}
module.exports = {
  get get() {
    return get;
  },
  get set() {
    return set;
  },
  __esModule: true
};
//# sourceMappingURL=config.js.map