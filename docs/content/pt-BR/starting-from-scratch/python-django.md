# Python / Django

### Criando uma aplicação Django

```sh
$ azk shell --image azukiapp/python --shell /bin/bash
# pip install Django
# django-admin startproject <my-app>
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

#### Python with Django

!INCLUDE "../../common/azkfilejs/python-django.md"
