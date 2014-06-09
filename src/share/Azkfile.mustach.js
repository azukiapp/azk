/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your sistem
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
    // Steps to run before run instances
    provision: [
      {{#each provision ~}}
      {{&json this}},
      {{/each ~}}
    ],
    {{/if ~}}
    {{#if workdir ~}}
    workdir: "{{&workdir}}",
    {{/if ~}}
    command: {{&json command}},
    {{#sync_files ~}}
    // Enable sync in current project folder to '/azk' in instances
    sync_files: {
      ".": "/azk/<%= manifest.dir %>",
    },
    {{/sync_files ~}}
    {{#persistent_dir ~}}
    // Active a persistent data folder in '/azk/_data_' in containers
    persistent_dir: true,
    {{/persistent_dir ~}}
    {{#balancer ~}}
    // Enable http balancer over the instances
    balancer: {
      // {{&name}}.{{& ../../azk.default_domain}}
      hostname: "<%= system.name %>.<%= azk.default_domain %>"
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
// Set a default system
setDefault("{{&default}}");
{{/if ~}}
{{#each bins ~}}
registerBin("{{&this.name}}", {{&json this.command}});
{{/each}}
