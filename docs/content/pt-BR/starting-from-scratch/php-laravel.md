# PHP / Laravel

### Criando uma aplicação Laravel

```sh
$ azk shell --image azukiapp/php-fpm --shell /bin/bash
# composer create-project laravel/laravel my-app --prefer-dist
# exit
```

### Gerando o Azkfile.js

```sh
$ cd my-app
$ azk init
```

### Rodando a aplicação

Para iniciar o ambiente de desenvolvimento

```sh
$ azk start -o && azk logs --follow
```

### Exemplos

#### PHP com Laravel

!INCLUDE "../../common/azkfilejs/php-laravel.md"
