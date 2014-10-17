/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  {{~#each systems}}
  {{&hash_key @key}}: {
    // Dependent systems
    depends: {{&json depends}},
    // More images:  http://images.azk.io
    {{~#if image.build}}
    image: {
      build: [
        {{~#each image.build}}
        {{&json this}},{{/each}}
      ]
    },
    {{~else}}
    image: {{&json image}},
    {{~/if}}
    {{~#if provision}}
    // Steps to execute before running instances
    provision: [
      {{~#each provision}}
      {{&json this}},{{/each}}
    ],
    {{~/if}}
    {{~#if workdir}}
    workdir: "{{&workdir}}",
    {{~/if}}
    command: {{&json command}},
    {{~#if mounts }}
    mounts: {
      {{~#each mounts}}
      '{{&@key}}': {{&mount this}},{{/each}}
    },
    {{~/if}}
    {{~#if mount_folders}}
    // Mounts folders to assigned paths
    mount_folders: {
      {{~#each mount_folders}}
      {{&hash_key @key}}: {{&json this}},{{/each}}
    },
    {{~/if}}
    {{~#if persistent_folders}}
    // Mounts a persistent data folders to assigned paths
    persistent_folders: [
      {{~#each persistent_folders}}
      {{&json this}},{{/each}}
    ],
    {{~/if}}
    {{~#if scalable}}
    scalable: {{&json scalable}},
    {{~/if}}
    {{~#if http}}
    http: {
      // {{&@key}}.{{& ../../azk.default_domain}}
      hostname: "#{system.name}.#{azk.default_domain}"
    },
    {{~/if}}
    {{~#if ports}}
    ports: {
      // exports global variables
      {{~#each ports}}
      {{&hash_key @key}}: {{&json this}},{{/each}}
    },
    {{~/if}}
    {{~#if envs}}
    envs: {
      // set instances variables
      {{~#each envs}}
      {{&hash_key @key}}: "{{this}}",{{/each}}
    },
    {{~/if}}
    {{~#if export_envs}}
    export_envs: {
      // exports variables for dependent systems
      {{~#each export_envs}}
      {{&hash_key @key}}: "{{&this}}",{{/each}}
    },
    {{~/if}}
    {{~#if docker_extra}}
    docker_extra: {
      // extra docker options
      {{~#if docker_extra.create }}
      create: {
        {{~#each docker_extra.create }}
        {{&hash_key @key}}: "{{&json this}}",{{/each}}
      },
      {{~/if}}
      {{~#if docker_extra.start }}
      start: {
        {{~#each docker_extra.start }}
        {{&hash_key @key}}: "{{&json this}}",{{/each}}
      },
      {{~/if}}
    },
    {{~/if}}
  },{{/each}}
});

{{#if defaultSystem}}
// Sets a default system
setDefault("{{&defaultSystem}}");
{{~/if}}
{{#each bins}}
registerBin("{{&this.name}}", {{&json this.command}});{{/each}}
