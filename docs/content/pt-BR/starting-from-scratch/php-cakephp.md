# PHP / CakePHP

### Criando uma aplicação CakePHP

```sh
$ azk shell --image azukiapp/php-fpm --shell /bin/bash
# composer create-project cakephp/app my-app --prefer-dist
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

#### PHP com CakePHP

!INCLUDE "../../common/azkfilejs/php-cakephp.md"
