## azk info

Displays information about the systems listed in `Azkfile.js`.

#### Options:

- `--colored, -C`     Displays colored output (default: true)

#### Usage:

     $ azk [options] info [path]

#### Example:

```
$ azk info

manifest:       /home/juliosaito/_git/azkfile-init-examples/Azkfile.js
cache_dir:      /home/juliosaito/_git/azkfile-init-examples/.azk/Azkfile.js
default_system: node010
systems:
  phpSample:
    depends: no dependencies
    image:   azukiapp/php-apache:5.6
    command: /bin/bash -c "echo \"Command not set in system \`phpSample\`\"; exit 1"
    ports:
      http: 80/tcp
  django17:
    depends: no dependencies
    image:   python:3.4
    command: /bin/bash -c "python manage.py runserver 0.0.0.0:$HTTP_PORT"
    ports:
      http: 5000/tcp
```
