/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

var config = require('azk').config;

systems({
  dns: {
    image: config("docker:image_default"),
    command: "dnsmasq --no-daemon --address=/<%= azk.default_domain %>/<%= azk.balancer_ip %>",
    ports: {
      dns: "53:53/udp",
    }
  },

  balancer_redirect: {
    image: config("docker:image_default"),
    command: "socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    ports: {
      http: "80:<%= azk.balancer_port %>/tcp",
    }
  }
});

