/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

var path   = require('path');
var fs     = require('fs');
var glob   = require('glob');
var config = require('azk').config;
var _      = require('lodash');

var itens = glob.sync("./!(lib|data|node_modules|npm-debug.log)");
var mount = _.reduce(itens, function(mount, item) {
  mount[item] = path.join("/azk", "#{manifest.dir}", item);
  return mount;
}, {});

if (fs.existsSync("../demos")) {
  mount["../demos"] = "/azk/demos";
}

var tmuxrc = path.join(env.HOME, ".tmux.conf");
if (fs.existsSync(tmuxrc)) {
  mount[tmuxrc] = "/.tmux.conf";
}

var agent_system = function(image) {
  return {
    image: image,
    provision: [
      "azk check-install",
    ],
    scale: false,
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    mount_folders: mount,
    persistent_folders: [
      "/azk/lib",
      "/azk/#{manifest.dir}/node_modules",
      "/azk/data",
      "/var/lib/docker",
    ],
    envs: {
      PATH: "/azk/#{manifest.dir}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      AZK_DATA_PATH: "/azk/data",
      AZK_LIB_PATH : "/azk/lib",
      AZK_BALANCER_HOST: "azk.linux",
      AZK_DOCKER_NS    : "azk.linux",
      AZK_BALANCER_PORT: 8080,
      //EXTRA_ARGS       : "-H tcp://0.0.0.0:2375 -H unix://",
      LOG: "file",
      NODE_ENV: "test",
      EXTRA_SCRIPT: "/azk/#{manifest.dir}/src/share/init_azk",
    },
    docker_extra: {
      start: { Privileged: true },
    }
  };
}

systems({

  'dind-ubuntu': agent_system('azukiapp/dind:ubuntu14'),
  'dind-fedora': agent_system('azukiapp/dind:fedora20'),

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
    shell: '/bin/bash',
    command: "dnsmasq -p $DNS_PORT --no-daemon --address=/#{azk.default_domain}/#{azk.balancer_ip}",
    wait: false,
    ports: {
      dns: "53:53/udp",
      80: disable,
    }
  },

  'balancer-redirect': {
    image: config("docker:image_default"),
    shell: '/bin/bash',
    command: "env; socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    ports: {
      http: "#{azk.balancer_port}:#{azk.balancer_port}/tcp",
      53: disable,
    }
  },
});

setDefault('docs');
