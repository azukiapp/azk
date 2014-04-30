import { _, resolve } from 'azk/utils';
var path = require('path');
var deepExtend = require('deep-extend');

// Root path
var azk_root =
  process.env.AZK_ROOT_PATH ||
  path.join('..', '..');

var data_path =
  process.env.AZK_DATA_PATH ||
  path.join(process.env.HOME, '.azk', 'data');

// Docker opts
var docker_host =
  process.env.AZK_DOCKER_HOST ||
  process.env.DOCKER_HOST     ||
  "http://azk-agent:4243";

function merge(options) {
  _.each(options, (values, key) => {
    if (key != '*')
      options[key] = deepExtend(options['*'], values);
  });
  return options;
}

var options = merge({
  '*': {
    azk_root: azk_root,
    manifest: "Azkfile.js",
    locale  : 'en-US',
    paths   : {
      data  : data_path,
    },
    docker  : {
      host          : docker_host,
      namespace     : 'azk',
      repository    : 'azk',
      image_default : 'racker/precise-with-updates:latest',
    },
    agent: {
      portrange_start: 11000,
      vm: {
        name      : "azk-agent",
        boot_disk : path.join(data_path, "vm", "debian2docker.iso"),
        data_disk : path.join(data_path, "vm", "azk-agent.vmdk"),
        blank_disk: path.join(data_path, "vm", "azk-agent.vmdk.bz"),
      }
    }
  },
  test: {
    docker: {
      namespace   : 'azk.test',
      repository  : 'azk-test',
      image_empty : 'cevich/empty_base_image',
    },
    agent: {
      vm: {
        name : "azk-agent-test",
        ssh_port  : 2223,
        data_disk : path.join(data_path, "vm", "azk-agent-test.vmdk"),
      }
    }
  }
});

function env() {
  return process.env.NODE_ENV || 'production';
}

export function get(key) {
  var keys   = key.split(':');
  var buffer = options[env()] || options['*'];

  for(var i = 0; i < keys.length; i++) {
    buffer = buffer[keys[i]];
    if (!buffer) break;
  }

  return buffer;
};

export function set(...args) {
}
