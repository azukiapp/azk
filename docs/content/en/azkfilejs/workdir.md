## workdir

Tells azk what the home folder of the system in question is to run the _commands_, _provisioning_ and _shell_ within a container.

#### Usage:

```js
workdir: 'FULL_PATH',
```

##### Examples:

Usually the `workdir` comes configured as `/azk/#{manifest.dir}`, which together with `mounts` indicates the _host_ folder where the `Azkfile.js` is located.

```js
workdir: '/azk/#{manifest.dir}',

mounts: {
  '/azk/#{manifest.dir}'  : path('.'),
},
```
