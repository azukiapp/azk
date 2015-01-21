## azk init

Inicializa o arquivo `Azkfile.js` baseando-se nos sistemas contidos na pasta atual.

#### Opções:

- `--force, -f`     Substitui o arquivo Azkfile.js se este já existir (padrão: falso)

#### Uso:

    $ azk [options] init [options] [path]

#### Exemplo:

```
$ azk init

azk init --force
azk: `node` system was detected at 'azkfile-init-examples/node010' as 'node010'
azk: `php` system was detected at 'azkfile-init-examples/phpSample' as 'phpSample'
azk: `phplaravel` system was detected at 'azkfile-init-examples/phpLaravel' as 'phpLaravel'
azk: `django` system was detected at 'azkfile-init-examples/django15' as 'django15'
```

