## mounts

Mounts has two different usage options: `path` and `persistent`. They're used to configure which folders will be internalized to the container or persisted internally by `azk`. 

#### path

```js
'INTERNAL_FOLDER': path('LOCAL_PATH'),
```

Mount the folder located in the current system machine `LOCAL_PATH`, relative to the Azkfile.js, to the path `INTERNAL_FOLDER` inside the system container. If any of the files are changed, from the user machine or from inside the container, the information is also updated on the other end.


#### persistent

```js
'INTERNAL_FOLDER': path('LOCAL_PATH'),
```

Persists the files that are inside the container on the path `INTERNAL_FOLDER`, to an `azk` persistent data folder in the user machine. The location the data will be saved will vary between Mac and Linux:

###### Mac

`/Users/heitorsergent/.azk/data/vm/azk-agent.vmdk.link`
`~/.azk/data/persistent_folders/#{manifest.id}/LOCAL_PATH`.
 
###### Linux

`~/.azk/data/persistent_folders/#{manifest.id}/LOCAL_PATH`.

Note that using the same 'LOCAL_PATH' in the same Azkfile.js, but in different containers, will mean that they'll share the persisted data.

#### Usage:

  ```js
  mounts: {
    'INTERNAL_FOLDER': path('LOCAL_PATH'),
    'INTERNAL_FOLDER': persistent('FOLDER_ID'),
  },
  ```

##### Examples:

* __path__: Mount the current project folder (`'.'`) with the name of the folder where the `Azkfile.js` is located. For example, if we are in the folder `/home/projetos/azkdemo`, our files within the container will be located in `/azk/azkdemo`.

  ```js
  mounts: {
    '/azk/#{manifest.dir}'  : path('.'),
  },
  ```

* __persistent__: Persists the files within the container that are on the path `/azk/bundler`. The files will usually be stored in the _host machine_ inside the folder `~/.azk/data/persistent_folders/_SOME_ID_`.

  ```js
  mounts: {
    '/azk/bundler'          : persistent('bundler'),
  },
  ```
