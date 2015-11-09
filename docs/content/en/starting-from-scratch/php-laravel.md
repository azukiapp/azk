# PHP / Laravel

### Generating a Laravel application

```sh
$ azk shell --image azukiapp/php-fpm --shell /bin/bash
# composer create-project laravel/laravel my-app --prefer-dist
# exit
```

### Creating the Azkfile.js

```sh
$ cd my-app
$ azk init
```

### Running application

To start the development environment

```sh
$ azk start -o && azk logs --follow
```

### Examples

#### PHP with Laravel

!INCLUDE "../../common/azkfilejs/php-laravel.md"
