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
    {{#mount_folders ~}}
    // Mounts folders to assigned paths
    mount_folders: {
      ".": "/azk/<%= manifest.dir %>",
    },
    {{/mount_folders ~}}
    {{#if persistent_folders ~}}
    // Mounts a persistent data folders to assigned paths
    persistent_folders: [
      {{#each persistent_folders ~}}
      {{&json this}},
      {{/each ~}}
    ],
    {{/if ~}}
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
