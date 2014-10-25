/**
 * Internal systems used by azk own
 */

var join_path = require('path').join;
var config    = require('azk').config;
var _         = require('azk')._;

// Default options for all systems
var _default = {
  image   : config("docker:image_default"),
  shell   : '/bin/bash',
  wait    : false,
  scalable: false,
}

systems({
  dns: _.defaults({
    command: "dnsmasq -p $DNS_PORT --no-daemon --address=/#{azk.default_domain}/#{azk.balancer_ip}",
    ports: {
      dns: "53:53/udp",
      80: disable,
    }
  }, _default),

  'balancer-redirect': _.defaults({
    command: "env; socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    wait: { retry: 3 },
    ports: {
      http: "#{azk.balancer_port}:#{azk.balancer_port}/tcp",
      53: disable,
    }
  }, _default),
});

// Set cache in azk data dir
setCacheDir(join_path(
  config('paths:data'),
  config('azk_dir'),
  "shared",
  "Azkfile.js"
));
