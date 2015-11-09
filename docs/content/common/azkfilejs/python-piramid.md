```js
systems({
  "pyramid": {
    depends: [],
    image: {
      "docker": "azukiapp/python:3.4.3"
    },
    provision: [
      "pip install --upgrade --user --allow-all-external pip",
      "python setup.py develop --prefix=/azk/pythonuserbase"
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "pserve development.ini --reload http_port=$HTTP_PORT",
    wait: {
      "retry": 20,
      "timeout": 1000
    },
    mounts: {
      '/azk/#{manifest.dir}': path("."),
      '/azk/pythonuserbase': persistent('pythonuserbase'),
    },
    scalable: {
      "default": 1
    },
    http: {
      domains: ["#{system.name}.#{azk.default_domain}"]
    },
    envs: {
      PATH: '/azk/pythonuserbase/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      PYTHON_ENV: 'development',
      PYTHONUSERBASE: '/azk/pythonuserbase',
    },
  },
});
```
