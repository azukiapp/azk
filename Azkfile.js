/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

var lodash = require('lodash');
var join   = require('path').join;
var config = require('azk').config;

var mounts = (function() {
  // Default mounts
  var mounts = {
    "/root/.npm"       : persistent('npm-cache'),
    "/.tmux.conf"      : join(env.HOME, ".tmux.conf"),
    "/azk/demos"       : "../demos",
    "/azk/build"       : persistent('build-#{system.name}'),
    "/azk/lib"         : persistent('lib-#{system.name}'),
    "/azk/data"        : persistent('data-#{system.name}'),
    "/azk/aptly"       : persistent('aptly-#{system.name}'),
    "/var/lib/docker"  : persistent('docker_files-#{system.name}'),
    "/azk/#{manifest.dir}/node_modules" : persistent('node_modules-#{system.name}'),
    "/root/.aptly.conf": path("./src/libexec/aptly.json")
  }

  var glob  = require('glob');
  var itens = glob.sync("./!(lib|data|node_modules|npm-debug.log|.git|.DS_Store|.azk)", { dot: true });

  mounts = lodash.reduce(itens, function(mount, item) {
    var key    = join("/azk", "#{manifest.dir}", item);
    mount[key] = path(item);
    return mount;
  }, mounts);

  return mounts;
})();

var agent_system = function(image, extras) {
  extras = extras || {};

  return lodash.merge({
    image: { docker: image },
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
      AZK_BALANCER_HOST: "linux.azk.io",
      AZK_BALANCER_PORT: 8080,
      LOG: "file",
      EXTRA_SCRIPT: "/azk/#{manifest.dir}/src/libexec/init_azk",
      VERSION: "#{azk.version}",
    },
    docker_extra: {
      HostConfig: { Privileged: true },
    }
  }, extras);
}

var test_package_system = function(image){
  return {
    depends: ["package"],
    image: { docker: image },
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
      AZK_BALANCER_HOST: "linux_dev.azk.io",
      LOG: "file", // Log docker to file
    },
    docker_extra: {
      HostConfig: { Privileged: true },
    }
  }
}

systems({
  'dind-ubuntu': agent_system('azukiapp/dind:ubuntu14'),
  'dind-fedora': agent_system('azukiapp/dind:fedora20'),

  package: agent_system('azukiapp/fpm', {
    shell: "/bin/bash",
    command: "azk nvm ./src/libexec/package-tools/server",
    scalable: { default: 0 },
    http: {
      domains: ["#{system.name}.azk.#{azk.default_domain}"],
    },
    ports: {
      http: "8080/tcp",
    },
  }),

  'pkg-ubuntu12-test': test_package_system('azukiapp/dind:ubuntu12'),
  'pkg-ubuntu14-test': test_package_system('azukiapp/dind:ubuntu14'),
  'pkg-fedora-test'  : test_package_system('azukiapp/dind:fedora20'),

  grunt: {
    image: { docker: "azukiapp/node" },
    workdir: "/azk/#{manifest.dir}",
    mounts: {
      "/azk/#{manifest.dir}": ".",
    },
    envs: {
      PATH: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/azk/#{manifest.dir}/node_modules/.bin"
    }
  },

  docs: {
    image: { docker: "azukiapp/python" },
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
});

setDefault('docs');
