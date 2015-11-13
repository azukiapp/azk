# Node.js

Example of generating a Node.js application:

## Using npm init

### Generating a package.json

```sh
$ mkdir <my-app>
$ cd <my-app>
$ azk shell --image azukiapp/node --shell /bin/bash
# npm init //follow the instructions afterwards
# exit
```

### Creating the Azkfile.js

```sh
$ azk init
```

## Using the express-generator module

### Generating the project

```sh
$ azk shell --image azukiapp/node --shell /bin/bash
# npm install -g express-generator
# express <my-app>
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

#### Node with Mongodb

!INCLUDE "../../common/azkfilejs/node-mongodb.md"
