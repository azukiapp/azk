/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

var envs = {
  DNS_DOMAIN: "resolver.dev",
  DNS_IP: "127.0.0.2",
  TERM: env.TERM,
  BUILD_FOLDER: "/azk/build",
}

// Adds the systems that shape your system
systems({
  ubuntu: {
    depends: ["dns"],
    image: "azukiapp/libnss-resolver:ubuntu",
    workdir: "/azk/#{manifest.dir}",
    command: "# command to run app",
    shell: "/bin/bash",
    mount_folders: {
      '.': "/azk/#{manifest.dir}",
      './mocker/nsswitch.conf': "/etc/nsswitch.conf",
      './mocker/resolver': "/etc/resolver",
    },
    persistent_folders: ["/azk/build"],
    envs: envs,
  },

  fedora: {
    depends: ["dns"],
    image: "azukiapp/libnss-resolver:fedora",
    workdir: "/azk/#{manifest.dir}",
    command: "# command to run app",
    shell: "/bin/bash",
    mount_folders: {
      '.': "/azk/#{manifest.dir}",
      './mocker/nsswitch.conf': "/etc/nsswitch.conf",
      './mocker/resolver': "/etc/resolver",
    },
    persistent_folders: ["/azk/build"],
    envs: envs,
  },

  package: {
    depends: ["dns"],
    image: "azukiapp/fpm",
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    mount_folders: {
      '.': '/azk/#{manifest.dir}',
    },
    envs: envs,
  },

  dns: {
    image: "azukiapp/azktcl:0.0.2",
    command: "dnsmasq --no-daemon --address=/$DNS_DOMAIN/$DNS_IP",
    wait: false,
    ports: {
      dns: "53/udp",
    },
    envs: envs,
  },
});



