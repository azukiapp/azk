import { _, resolve } from 'azk/utils';
var path = require('path');
var deepExtend = require('deep-extend');

// Root path
var azk_root =
  process.env.AZK_ROOT_PATH ||
  path.join('..', '..');

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
    azk_root        : azk_root,
    manifest        : "Azkfile.js",
    locale          : 'en-US',
    docker          : {
      host          : docker_host,
      namespace     : 'azk',
      repository    : 'azk',
      image_default : 'racker/precise-with-updates:latest',
    }
  },
  test: {
    docker: {
      namespace   : 'azk.test',
      repository  : 'azk-test',
      image_empty : 'cevich/empty_base_image',
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
