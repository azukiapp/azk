# Node.js

Exemplos de criação de uma aplicação Node.js:

## Utilizando o npm init

### Criando o package.json

```sh
$ mkdir <my-app>
$ cd <my-app>
$ azk shell --image azukiapp/node --shell /bin/bash
# npm init //follow the instructions afterwards
# exit
```

### Gerando o Azkfile.js

```sh
$ azk init
```

## Utilizando o módulo express-generator

### Criando o projeto

```sh
$ azk shell --image azukiapp/node --shell /bin/bash
# npm install -g express-generator
# express <my-app>
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

### Exemplos

#### Node com Mongodb

!INCLUDE "../../common/azkfilejs/node-mongodb.md"
