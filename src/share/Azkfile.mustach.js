/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  {{#each systems ~}}
  {{&hash_key @key}}: {
    // Dependent systems
    depends: {{&json depends}},
    // More images:  http://images.azk.io
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
    // Steps to execute before running instances
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
    // Mounts current system folder at '/azk/[system_name]'
    sync_files: {
      ".": "/azk/<%= manifest.dir %>",
    },
    {{/sync_files ~}}
    {{#persistent_dir ~}}
    // Activates a persistent data folder in '/azk/_data_' 
    persistent_dir: true,
    {{/persistent_dir ~}}
    {{#balancer ~}}
    // Enables http balancer over instances
    balancer: {
      // {{&name}}.{{& ../../azk.default_domain}}
      hostname: "<%= system.name %>.<%= azk.default_domain %>"
    },
    {{/balancer ~}}
    envs: {
      // Exports global variables
      {{#each envs ~}}
      {{@key}}: "{{this}}",
      {{~/each}}
    }
  },
  {{~/each}}
});

{{#if default ~}}
// Sets a default system
setDefault("{{&default}}");
{{/if ~}}
{{#each bins ~}}
registerBin("{{&this.name}}", {{&json this.command}});
{{/each}}
