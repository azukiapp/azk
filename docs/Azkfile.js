/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  'docs-azk': {
    image: { docker: "azukiapp/node" },

    // Steps to execute before running instances
    provision: [
      "npm i",
      "gitbook install content",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "gitbook serve --port $HTTP_PORT content --lrport $LIVERELOAD_PORT",
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}'         : sync(".", {shell: true}),
      '/azk/.github/CONTRIBUTING.md' : path("../.github/CONTRIBUTING.md"),
      '/azk/package.json'            : path("./package.json"),
      '/azk/#{manifest.dir}/content/pt-BR/styles' : sync("./content/common/styles", {shell: true}),
      '/azk/#{manifest.dir}/content/en/styles'    : sync("./content/common/styles", {shell: true}),
      '/azk/#{manifest.dir}/node_modules'         : persistent("node_modules"),
      '/azk/#{manifest.dir}/content/_book'        : persistent("book"),
      '/azk/#{manifest.dir}/content/node_modules' : persistent("content/node_modules"),
      '/root/.npm'     : persistent("npm-cache"),
      '/root/.gitbook' : persistent("gitbook-versions"),
    },
    scalable: {"default": 1},
    http: {
      // docs-azk.
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    envs: {
      PATH: "/azk/#{manifest.dir}/node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    },
    ports: {
      http:       "5000/tcp",
      livereload: "35730:35730/tcp",
    },
  },
});
