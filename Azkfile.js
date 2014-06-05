/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

systems({
  bash_test: {
    image: "azukiapp/busybox",
    provision: [
      "/azk/<%= system.name %>/src/bashttpd",
      "exit 0",
    ],
    command: "socat TCP4-LISTEN:$PORT,fork EXEC:/azk/<%= system.name %>/src/bashttpd",
    persistent_dir: true,
    workdir: "<%= system.persistent_dir %>",
    sync_files: {
      "./spec/fixtures/test-app": "/azk/<%= system.name %>",
    },
    // Enable balancer over the instances
    balancer: {
      hostname: "<%= system.name %>.<%= manifest.project_name %>.<%= azk.default_domain %>",
      alias: [
        "azk-bash.<%= azk.default_domain %>"
      ]
    },
  },

  balancer_redirect: {
    image: "azukiapp/busybox",
    command: "socat TCP4-LISTEN:$HTTP_PORT,fork TCP:$BALANCER_IP:$BALANCER_PORT",
    ports: {
      http: "80:<%= azk.balancer_port %>/tcp",
    }
  }
});

