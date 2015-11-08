# Ruby on Rails

### Criando uma aplicação Rails

```sh
$ azk shell --image azukiapp/ruby --shell /bin/bash
# gem install rails --no-rdoc --no-ri
# rails new <my-app>
# exit
```

### Gerando o Azkfile.js

```sh
$ cd <my-app>
$ azk init
```

### Rodando a aplicação

Para iniciar o ambiente de desenvolvimento

```sh
$ azk start -o && azk logs --follow
```

Para rodar os testes

```sh
$ azk start test
$ azk shell test -- bundle exec rake test
```

Lembrando que se o seu ambiente de testes exigir dependência do OS como Webkit e QT4, você precisa mudar a imagem do Docker

### Examplos

#### Ruby on Rails com MySQL

!INCLUDE "../../common/azkfilejs/ruby-rails.md"
