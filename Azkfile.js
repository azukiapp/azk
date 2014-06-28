/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

var config = require('azk').config;

systems({

  grunt: {
    image: "dockerfile/nodejs",
    workdir: "/azk/<%= manifest.dir %>",
    mount_folders: {
      ".": "/azk/<%= manifest.dir %>",
    },
    envs: {
      PATH: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/azk/<%= manifest.dir %>/node_modules/.bin"
    }
  },

  docs: {
    image: "dockerfile/python",
    //provision: [
      //'export INSTALL_DIR=/azk/<%= manifest.dir %>/vendor/python',
      //'pip install --target=$INSTALL_DIR --install-option="--install-scripts=$INSTALL_DIR/bin" sphinx',
    //],
    workdir: "/azk/<%= manifest.dir %>",
    mount_folders: {
      ".": "/azk/<%= manifest.dir %>",
    },
    //envs: {
      //PYTHONPATH: "/azk/<%= manifest.dir %>/vendor/python",
      //PATH: "/bin:/sbin:/usr/bin:/usr/sbin:/azk/<%= manifest.dir %>/vendor/python/bin"
    //}
  },

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
  },
});

setDefault('docs');
