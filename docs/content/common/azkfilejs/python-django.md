```js
systems({
  'my-django17-app': {
    depends: [],
    image: {"docker": "azukiapp/python:3.4"},
    provision: [
      "pip install --user --allow-all-external -r requirements.txt",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "python manage.py runserver 0.0.0.0:$HTTP_PORT",
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/pythonuserbase': persistent("pythonuserbase"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    envs: {
      PATH: "/azk/pythonuserbase/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      PYTHONUSERBASE: "/azk/pythonuserbase",
    },
  },
});
```
