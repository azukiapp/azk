## provision

Specifies a list of commands to be run before the system is ready to run `command`.

This property exists to give to the system the opportunity to run commands which depend on project files and, due to that, couldn't be run at the image creation moment. Tasks such as installation of dependencies or database migrations are good candidates for this property.

### Observations

- The `provision` step is run as a single command which is resulted from the concatenation of the command list, separated by `&&`. Hence, in order to the `provision` all the commands on that list must return `0` so the `provision` step be considered as successful. Otherwise, it'll fail and will show the commands output;

- It's important to notice this isn't where you shuld customize your images, and any information that have to be persisted, should be done using mounted folders.

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

For systems using __Rails__ it's common to run `bundle install` and `rake db:migrate`.

```js
rails_system: {
  provision: [
    "bundle install --path /azk/bundler",
    "bundle exec rake db:migrate",
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": sync("."),
    "/azk/bundler": persistent("bundler"),
  }
},
```

____________________
For systems using __Node.js__, it's common to use `npm install` to install the dependencies.

```js
node_system: {
  provision: [
    "npm install"
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": sync("."),
    "/azk/#{manifest.dir}/node_modules": persistent("modules"),
  }
},

```
It's important to notice that both cases (__Rails__ and __Node.js__) use persistent folders to store the installed dependencies. Otherwise, those installations would be done on an temporary instance and all data would be lost as soon as the `provision` step is finished.

