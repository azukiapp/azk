# Python / Django

### Generating a Django application

```sh
$ azk shell --image azukiapp/python --shell /bin/bash
# pip install Django
# django-admin startproject <my-app>
# exit
```

### Creating the Azkfile.js

```sh
$ cd <my-app>
$ azk init
```

### Running application

To start the development environment

```sh
$ azk start -o && azk logs --follow
```

### Examples

#### Python with Django

!INCLUDE "../../common/azkfilejs/python-django.md"
