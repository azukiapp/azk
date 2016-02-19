# PHP / CakePHP

### Generating a CakePHP application

```sh
$ azk shell --image azukiapp/php-fpm --shell /bin/bash
# composer create-project cakephp/app my-cake-php --prefer-dist
# exit
```

### Creating the Azkfile.js

```sh
$ cd my-cake-php
$ azk init
```

### Running application

To start the development environment

```sh
$ azk start -o && azk logs --follow
```

### Examples

#### PHP with CakePHP

!INCLUDE "../../common/azkfilejs/php-cakephp.md"
