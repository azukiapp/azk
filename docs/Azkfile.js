/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  'docs-azk': {
    image: "node:0.10",

    // Steps to execute before running instances
    provision: [
      "npm i",
      "node node_modules/.bin/gitbook install content",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "node node_modules/.bin/gitbook serve --port $HTTP_PORT content",
    wait: {"retry": 20, "timeout": 1000},
    mounts: {
      '/azk/#{manifest.dir}': path("."),
      '/azk/bundler': persistent("bundler"),
    },
    scalable: {"default": 1},
    http: {
      // docs-azk.
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      livereload: "35729:35729/tcp",
    },
  },
});



