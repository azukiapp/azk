/**
 * Internal systems used by azk own
 */

var join_path = require('path').join;
var config    = require('azk').config;
var _         = require('azk')._;

// Default options for all systems
systems({
  'azktcl-base': {
    image   : { docker: config("docker:image_default") },
    shell   : '/bin/bash',
    wait    : false,
    scalable: false,
  },

  dns: {
    extends: 'azktcl-base',
    command: "dnsmasq -p $DNS_PORT --no-daemon --address=/#{azk.default_domain}/#{azk.balancer_ip}",
    ports: {
      dns: "53:53/udp",
      80: disable,
    }
  },

  'balancer-redirect': {
    extends: 'azktcl-base',
    command: "env; socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    wait: { retry: 3 },
    ports: {
      http: "#{azk.balancer_port}:#{azk.balancer_port}/tcp",
      53: disable,
    }
  },

});

// Set cache in azk data dir
setCacheDir(config('paths:azk_meta'));
