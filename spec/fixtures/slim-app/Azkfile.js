/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */
/* global systems, path */
var socat = function(port) {
  return "socat TCP4-LISTEN:" + port + ",fork EXEC:`pwd`/src/bashttpd";
};

// Adds the systems that shape your system
systems({
  example: {
    // Dependent systems
    depends: [],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/azktcl:0.0.2"},
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: socat('80') + " &0>/dev/null ; " + socat('53') + " &0>/dev/null ; " + socat('53'),
    wait: {"retry": 20, "timeout": 1000},
    provision: [
      "ls -l ./src",
      "./src/bashttpd",
      "touch provisioned",
      "exit 0"
    ],
    mounts: {
      '/azk/#{manifest.dir}': path("."),
    },
    envs: {
      // set instances variables
      EXAMPLE: "value",
    },
  },
  deploy: {
    image: { docker: "azukiapp/alpine" },
  }
});
