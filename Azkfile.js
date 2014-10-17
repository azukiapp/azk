/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest


var config = require('azk').config;
var mounts = (function() {
  var _    = require('lodash');
  var join = require('path').join;
  var glob = require('glob');

  var mounts = {
    "/.tmux.conf"      : join(env.HOME, ".tmux.conf"),
    "/azk/demos"       : "../demos",
    "/azk/build"       : persistent('build-#{system.name}'),
    "/azk/lib"         : persistent('lib-#{system.name}'),
    "/azk/data"        : persistent('data-#{system.name}'),
    "/var/lib/docker"  : persistent('docker_files-#{system.name}'),
    "/azk/#{manifest.dir}/node_modules": persistent('node_modules-#{system.name}'),
    "/azk/#{manifest.dir}/.nvmrc" : ".nvmrc",
  }

  var itens = glob.sync("./!(lib|data|node_modules|npm-debug.log)");
  mounts = _.reduce(itens, function(mount, item) {
    var key = join("/azk", "#{manifest.dir}", item);
    mount[key] = item;
    return mount;
  }, mounts);

  return mounts;
})();

var agent_system = function(image) {
  return {
    image: image,
    provision: [
      "azk check-install",
    ],
    scale: false,
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    mounts: mounts,
    envs: {
      PATH: "/azk/#{manifest.dir}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      AZK_DATA_PATH: "/azk/data",
      AZK_LIB_PATH : "/azk/lib",
      AZK_NAMESPACE: "azk.linux",
      AZK_PACKAGE_PATH: "/azk/build",
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

var test_package_system = function(image){
  return {
    image: image,
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    mounts: {
      "/azk/demos"          : "../demos",
      "/azk/#{manifest.dir}": ".",
      "/azk/data"           : persistent('data-#{system.name}'),
      "/var/lib/docker"     : persistent('docker_files-#{system.name}'),
    },
    envs: {
      AZK_DATA_PATH: "/azk/data",
      LOG: "file", // Log docker to file
    },
    docker_extra: {
      start: { Privileged: true },
    }
  }
}

systems({

  'dind-ubuntu': agent_system('azukiapp/dind:ubuntu14'),
  'dind-fedora': agent_system('azukiapp/dind:fedora20'),

  package: agent_system('azukiapp/fpm'),
  'pkg-ubuntu12-test': test_package_system('azukiapp/dind:ubuntu12'),
  'pkg-ubuntu14-test': test_package_system('azukiapp/dind:ubuntu14'),
  'pkg-fedora-test': test_package_system('azukiapp/dind:fedora20'),

  grunt: {
    image: "dockerfile/nodejs",
    workdir: "/azk/#{manifest.dir}",
    mounts: {
      "/azk/#{manifest.dir}": ".",
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
    workdir: "/azk/#{manifest.dir}",
    mounts: {
      "/azk/#{manifest.dir}": ".",
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
