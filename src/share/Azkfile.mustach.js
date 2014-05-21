/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

systems({
  {{#each systems ~}}
  {{&name}}: {
    {{#if depends ~}}
    depends: {{&json depends}},
    {{/if ~}}
    image: {{&json image}},
    {{#balancer ~}}
    // Enable balancer over de instances
    balancer: {
      hostname: "{{&name}}_<%= system.name %>",
      alias: [
        "front.<%= azk.default_domain %>"
      ]
    },
    {{/balancer ~}}
    command: "{{&command}}",
    {{#sync_files ~}}
    // Enable sync current project folder to '/app' in containers
    sync_files: {
      ".": "/app",
    },
    {{/sync_files ~}}
    {{#data_folder ~}}
    // Active a persistent data folder in '/data' in containers
    data_folder: true,
    {{/data_folder ~}}
    envs: {
      {{#each envs ~}}
      {{@key}}: "{{this}}",
      {{~/each}}
    }
  },
  {{~/each}}
});

setDefault("{{default}}");
//registerBin("rails-c", ["exec", "-i", "/bin/bash", "-c", "rails c"]);
