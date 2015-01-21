## mounts

Configure which folders will be internalized to the container or persisted internally by `azk`.

#### Usage:

```js
mounts: {
  'PASTA_INTERNA': path('LOCAL_PATH'),
  'PASTA_INTERNA': persistent('FOLDER_ID'),
},
```

##### Examples:

* __path__: Mount the current project folder (`'.'`) with the name of the folder where the `Azkfile.js` is located. For example, if we are in the folder `/home/projetos/azkdemo`, our files within the container will be located in `/azk/azkdemo`.

```js
mounts: {
  '/azk/#{manifest.dir}'  : path('.'),
},
```

_________________
* __persistent__: Persists the files within the container that are on the path `/azk/bundler`. The files will usually be stored in the _host machine_ inside the folder `~/.azk/data/persistent_folders/_SOME_ID_`.

```js
mounts: {
  '/azk/bundler'          : persistent('bundler'),
},
```