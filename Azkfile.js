/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

var mounts = {
  "/azk/#{manifest.dir}": sync('./', { shell: true }),
  "/azk/#{manifest.dir}/package": path("./package"),
  "/azk/#{manifest.dir}/node_modules": persistent('node_modules-#{system.name}'),
  "/azk/demos"          : path("../demos"),
  "/azk/build"          : persistent('build-#{system.name}'),
  "/azk/lib"            : persistent('lib-#{system.name}'),
  "/azk/data"           : persistent('data-#{system.name}'),
  "/azk/aptly"          : persistent('aptly-#{system.name}'),
  "/var/lib/docker"     : persistent('docker_files-#{system.name}'),
  "/root/.npm"          : persistent('npm-cache'),
  "/usr/local/bin/make" : path("./src/libexec/make"),
  "/root/.aptly.conf"   : path("./src/libexec/aptly.json"),
  "/.tmux.conf"         : path(env.HOME + "/.tmux.conf"),
};

var envs = {
  PATH: "/azk/#{manifest.dir}/bin:/usr/local/bundle/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  AZK_ENV      : "development",
  AZK_DATA_PATH: "/azk/data",
  AZK_LIB_PATH : "/azk/lib",
  AZK_NAMESPACE: "azk.linux",
  AZK_PACKAGE_PATH: "/azk/build",
  AZK_BALANCER_HOST: "linux.azk.io",
  AZK_BALANCER_PORT: 8080,
  LOG: "file",
  EXTRA_SCRIPT: "/azk/#{manifest.dir}/src/libexec/init_azk",
  VERSION: "#{azk.version}",
};

systems({
  package: {
    image: { docker: 'azukiapp/fpm:1.4.0' },
    shell: "/bin/bash",
    workdir: "/azk/#{manifest.dir}",
    command: "azk nvm ./src/libexec/package-tools/server",
    scalable: { default: 0 },
    mounts: mounts,
    envs: envs,
    http: {
      domains: ["#{system.name}.azk.#{azk.default_domain}"],
    },
    ports: {
      http: "8080/tcp",
    },
  },

  'dind-ubuntu12': {
    image: { docker: 'azukiapp/dind:ubuntu12' },
    scalable: false,
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    mounts: mounts,
    envs: envs,
    docker_extra: {
      HostConfig: { Privileged: true },
    }
  },

  'dind-ubuntu14': {
    extends: "dind-ubuntu12",
    image: { docker: 'azukiapp/dind:ubuntu14' },
  },

  'dind-ubuntu15': {
    extends: "dind-ubuntu12",
    image: { docker: 'azukiapp/dind:ubuntu15' },
  },

  'dind-fedora': {
    extends: "dind-ubuntu12",
    image: { docker: 'azukiapp/dind:fedora20' },
  },

  'pkg-ubuntu12-test': {
    depends: ["package"],
    image: { docker: 'azukiapp/dind:ubuntu12' },
    workdir: "/azk/#{manifest.dir}",
    shell: "/usr/local/bin/wrapdocker",
    mounts: {
      "/azk/demos"              : path("../demos"),
      "/azk/#{manifest.dir}/src": sync("./src"),
      "/azk/data"               : persistent('data-#{system.name}'),
      "/var/lib/docker"         : persistent('docker_files-#{system.name}'),
    },
    envs: {
      AZK_DATA_PATH: "/azk/data",
      AZK_BALANCER_HOST: "linux_dev.azk.io",
      LOG: "file", // Log docker to file
    },
    docker_extra: {
      HostConfig: { Privileged: true },
    }
  },

  'pkg-ubuntu14-test': {
    extends: "pkg-ubuntu12-test",
    image: { docker: 'azukiapp/dind:ubuntu14' },
  },

  'pkg-ubuntu15-test': {
    extends: "pkg-ubuntu12-test",
    image: { docker: 'azukiapp/dind:ubuntu15' },
  },

  'pkg-fedora20-test': {
    extends: "pkg-ubuntu12-test",
    image: { docker: 'azukiapp/dind:fedora20' },
  },
});
