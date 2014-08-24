/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

var config = require('azk').config;

systems({

  agent: {
    image: "azukiapp/dind",
    provision: [
      "azk check-install",
    ],
    scale: false,
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    mount_folders: {
      ".": "/azk/#{manifest.dir}",
    },
    persistent_folders: [
      "/azk/#{manifest.dir}/node_modules",
      "/azk/data",
      "/var/lib/docker",
    ],
    ports: {
      azk_balancer: "8080/tcp",
    },
    envs: {
      PATH: "/azk/#{manifest.dir}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      AZK_DATA_PATH: "/azk/data",
      AZK_DOCKER_NS    : "azk.linux",
      AZK_BALANCER_IP  : '127.0.0.1',
      AZK_BALANCER_PORT: 8080,
      LOG: "file",
    },
    docker_extra: {
      start: { Privileged: true },
    }
  },

  grunt: {
    image: "dockerfile/nodejs",
    workdir: "/azk/#{manifest.dir}",
    mount_folders: {
      ".": "/azk/#{manifest.dir}",
    },
    envs: {
      PATH: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/azk/#{manifest.dir}/node_modules/.bin"
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
    command: "dnsmasq -p $DNS_PORT --no-daemon --address=/#{azk.default_domain}/#{azk.balancer_ip}",
    wait: false,
    ports: {
      dns: "53:53/udp",
    }
  },

  'balancer-redirect': {
    image: config("docker:image_default"),
    command: "socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    ports: {
      http: "80:#{azk.balancer_port}/tcp",
    }
  },
});

setDefault('docs');
