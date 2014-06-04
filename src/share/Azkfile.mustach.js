/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Global image to reuse
//addImage('base', { repository: "cevich/empty_base_image" }); // tag: latest

systems({
  {{#each systems ~}}
  {{&hash_key @key}}: {
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
    {{#if provision ~}}
    provision: [
      {{#each provision ~}}
      {{&json this}},
      {{/each ~}}
    ],
    {{/if}}
    {{#if workdir ~}}
    workdir: "{{&workdir}}",
    {{/if ~}}
    command: {{&json command}},
    {{#sync_files ~}}
    // Enable sync in current project folder to '/app' in containers
    sync_files: {
      ".": "/azk/<%= manifest.dir %>",
    },
    {{/sync_files ~}}
    {{#persistent_dir ~}}
    // Active a persistent data folder in '/azk/_data_' in containers
    persistent_dir: true,
    {{/persistent_dir ~}}
    {{#balancer ~}}
    // Enable balancer over the instances
    balancer: {
      hostname: "<%= system.name %>.<%= azk.default_domain %>",
      alias: [
        "front.<%= azk.default_domain %>"
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
setDefault("{{&hash_key default}}");
{{/if ~}}
{{#each bins ~}}
registerBin("{{&this.name}}", {{&json this.command}});
{{/each}}
