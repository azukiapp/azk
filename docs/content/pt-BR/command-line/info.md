## azk info

Exibe informações dos sistemas listados no `Azkfile.js`.

#### Opções:

- `--colored, -C`     Exibe saída em cores (padrão: verdadeiro)

#### Uso:

     $ azk [options] info [path]

#### Exemplo:

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
