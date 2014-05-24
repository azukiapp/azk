/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

systems({
  {{#each systems ~}}
  {{&name}}: {
    // Dependent systems
    depends: {{&json depends}},
    // More imagens http://images.azk.io
    {{#if image.build ~}}
    image: {
      build: [
        {{#each image.build ~}}
        {{&json this}},
        {{/each ~}}
      ]
    },
    {{else ~}}
    image: {{&json image}},
    {{/if ~}}
    {{#if workdir ~}}
    workdir: "{{&workdir}}",
    {{/if ~}}
    command: "{{&command}}",
    {{#sync_files ~}}
    // Enable sync in current project folder to '/app' in containers
    sync_files: {
      ".": "/app",
    },
    {{/sync_files ~}}
    {{#data_folder ~}}
    // Active a persistent data folder in '/data' in containers
    data_folder: true,
    {{/data_folder ~}}
    {{#balancer ~}}
    // Enable balancer over the instances
    balancer: {
      hostname: "<%= system.name %>.<%= default_domain %>",
      alias: [
        "front.<%= default_domain %>"
      ]
    },
    {{/balancer ~}}
    envs: {
      // Export global variables
      {{#each envs ~}}
      {{@key}}: "{{this}}",
      {{~/each}}
    }
  },
  {{~/each}}
});

{{#if default ~}}
setDefault("{{default}}");
{{/if ~}}
{{#each bins ~}}
registerBin("{{&this.name}}", {{&json this.command}});
{{/each}}
