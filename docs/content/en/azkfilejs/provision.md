## provision

Specifies some commands to be executed before the system is ready to run `command`. For very heavy tasks.

#### Usage:

```js
provision: [
    'COMMAND 1',
    'COMMAND 2',
    ...,
    'COMMAND N'
],
```

##### Examples:

For systems using __rails__ it's common to run `bundle install` and `rake db`.

```js
rails_system: {
  provision: [
    "bundle install --path /azk/bundler",
    "bundle exec rake db:create",
    "bundle exec rake db:migrate",
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": path("."),
    "/azk/bundler": persistent("bundler"),
  }
},
```

____________________
For systems using __node.js__, it's common to use `npm install` to install the dependencies.

```js
node_system: {
  provision: [
    "npm install"
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": path("."),
    "/azk/#{manifest.dir}/node_modules": persistent("modules"),
  }
},
```
