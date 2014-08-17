/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

var envs = {
  DNS_DOMAIN: "resolver.dev",
  DNS_IP: "127.0.0.2",
  TERM: env.TERM,
}

// Adds the systems that shape your system
systems({
  build: {
    // Dependent systems
    depends: ["dns"],
    // More images:  http://images.azk.io
    image: "azukiapp/resolver-nss",
    workdir: "/azk/#{manifest.dir}",
    command: "# command to run app",
    shell: "/bin/bash",
    // Mounts folders to assigned paths
    mount_folders: {
      '.': "/azk/#{manifest.dir}",
      './mocker/nsswitch.conf': "/etc/nsswitch.conf",
      './mocker/resolver': "/etc/resolver",
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



