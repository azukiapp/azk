import { _, resolve } from 'azk/utils';
var path = require('path');
var deepExtend = require('deep-extend');

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
    manifest        : "Azkfile.js",
    locale          : 'en-US',
    docker          : {
      host          : docker_host,
      namespace     : 'azk',
      image_default : 'racker/precise-with-updates:latest',
    }
  },
  test: {
    docker: {
      namespace: 'azk.test'
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
