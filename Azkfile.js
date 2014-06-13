/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

systems({
  dns: {
    image: "<%= azk.default_image %>",
    command: "dnsmasq --no-daemon --address=/<%= azk.default_domain %>/<%= azk.balancer_ip %>",
    ports: {
      dns: "53:53/udp",
    }
  },

  balancer_redirect: {
    image: "<%= azk.default_image %>",
    command: "socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    ports: {
      http: "80:<%= azk.balancer_port %>/tcp",
    }
  }
});

