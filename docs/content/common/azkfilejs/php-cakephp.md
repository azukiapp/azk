```js
systems({
  'my-cakephp-app': {
    depends: [],
    image: {"docker": "azukiapp/php-fpm:5.6"},
    provision: [
      "composer install"
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/#{manifest.dir}/vendor': persistent("./vendor"),
      '/azk/#{manifest.dir}/composer.phar': persistent("./composer.phar"),
      '/azk/#{manifest.dir}/composer.lock': path("./composer.lock"),
      '/azk/#{manifest.dir}/node_modules': persistent("./node_modules"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      http: "80/tcp",
    },
    envs: {
      APP_DIR: "/azk/#{manifest.dir}",
    },
  },
});
```
