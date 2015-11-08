# Ruby on Rails

### Generating a Rails application

```sh
$ azk shell --image azukiapp/ruby --shell /bin/bash
# gem install rails --no-rdoc --no-ri
# rails new <my-app>
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

To start the test environment

```sh
$ azk start test
$ azk shell test -- bundle exec rake test
```

If your test environment requires OS dependencies like Webkit and QT4, you need to change the Docker image.

### Examples

#### Ruby on Rails with MySQL

!INCLUDE "../../common/azkfilejs/ruby-rails.md"
