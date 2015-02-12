## azk init

Inicializa o arquivo `Azkfile.js` baseando-se nos sistemas contidos na pasta atual.

#### Opções:

- `--force, -f`     Substitui o arquivo Azkfile.js se este já existir (padrão: falso)

#### Uso:

    $ azk [options] init [options] [path]

#### Exemplo:

```
$ azk init

azk: [phpLaravel] A `php` system was detected at '/home/projects/main-project/phpLaravel'.
azk: [phpLaravel] The image suggested was `{"docker":"azukiapp/php-fpm:5.6"}`.

azk: [django15] A `django` system was detected at '/home/projects/main-project/django15'.
azk: [django15] The image suggested was `{"docker":"python:2.7"}`.

azk: [phpSample] A `php` system was detected at '/home/projects/main-project/phpSample'.
azk: [phpSample] The image suggested was `{"docker":"azukiapp/php-fpm"}`.
azk: [phpSample] ! It was not possible to detect the `php` specific version, so the standard version was suggested instead.
azk: [phpSample] ! To change the image version you must edit the `Azkfile.js` file.
azk: [phpSample] ! For more information see the documentation at http://docs.azk.io/en/images/index.html.
azk: 'Azkfile.js' generated

Tip:
  Adds the `.azk` in .gitignore
  echo '.azk' >> .gitignore

```
