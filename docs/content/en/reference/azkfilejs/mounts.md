## mounts

Mounts has three different usage options: `path`, `persistent` and `sync`. They're used to configure which folders will be internalized to the container or persisted internally by `azk`. 

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

The folder is stored in a virtual disk (`~/.azk/data/vm/azk-agent.vmdk`) in the path `/azk/persistent_folders`. This disk is mounted in the path `/mnt/sda1` of the VM.
 
###### Linux

`~/.azk/data/persistent_folders/#{manifest.id}/LOCAL_PATH`.

Note that using the same 'LOCAL_PATH' in the same Azkfile.js, but in different containers, will mean that they'll share the persisted data.

#### sync

```js
'INTERNAL_FOLDER': sync('LOCAL_PATH' [, OPTS]),
```

Syncs the files in `LOCAL_PATH` with a remote destination, which is mounted in the `INTERNAL_FOLDER`. Differently from `path` option, `sync` uses [rsync](https://rsync.samba.org/) instead of VirtualBox [shared folders](https://www.virtualbox.org/manual/ch04.html#sharedfolders). As result, the overall performance is significantly increased, mainly for applications which demand a great number of files (e.g. a Ruby on Rails application with a lot of assets).


##### OPTS (optional)

* `except`: an `Array` of files and/or folders to be ignored in the sync process. It uses [glob patterns](http://teaching.idallen.com/dat2330/06w/notes/glob_patterns.txt). Useful hints:
  * **Exclude a file**: `{except: ["./path/to/the/file.png"]}`
  * **Exclude a folder**: `{except: ["./path/to/the/folder/"]}` // *Mind the tailing slash!*
  * **Exclude all CSS files**: `{except: ["*.css"]}`

  > By default, `azk` ignores the following elements when syncing: `.rsyncignore`, `.gitignore`, `Azkfile.js`, `.azk/` and `.git/`.

* `daemon`: a `boolean` value that indicates if, when running `azk` in daemon mode (e.g. `azk start`), `azk` should either use or not use the `sync` scheme (in the negative case, the `path` scheme is used) (default: `true`);
* `shell`: similarly to `daemon` option, it's a `boolean` value that indicates if, when running `azk` in shell mode (e.g. `azk shell`), `azk` should either use or not use the `sync` scheme (in the negative case, the `path` scheme is used) (default: `false`). Setting as `false` is particularly useful to keep a two-way sync, allowing created files in the shell (e.g. via `$ rails generate scaffold User name:string`) to be persisted back in the original project folder;

##### Destination synced data

The destination path of the data that will be synced will vary between Mac and Linux:

###### Mac

`~/.azk/data/sync_folders/#{manifest.id}/LOCAL_PATH`.
 
###### Linux

`~/.azk/data/sync_folders/#{manifest.id}/LOCAL_PATH`.

Note that using the same 'LOCAL_PATH' in the same Azkfile.js, but in different containers, will mean that they'll share the data.

> **IMPORTANT NOTE:** If you are facing performance issues using `azk` with your application, you should use this option when mounting your source code. Note it's a one-way sync, so you still have to add entries in `mounts` indicating which folders need to use the `share` option (using `path` or `persistent`).

### Examples

* __path__: Mount the current project folder (`'.'`) in the container on the path `/azk/azkdemo` (considering `azkdemo` is the name of the folder where the `Azkfile.js` is located).

  ```js
  mounts: {
    '/azk/#{manifest.dir}' : path('.'),
  },
  ```

* __persistent__: Persists the files within the container that are on the path `/azk/bundler`. The files, in this case, will be stored in the _guest machine_ inside the folder `~/.azk/data/persistent_folders/#{manifest.id}/`.

  ```js
  mounts: {
    '/azk/bundler' : persistent('bundler'),
  },
  ```

* __sync__: Syncs the project files within the container on the path `/azk/azkdemo` (considering `azkdemo` is the name of the folder where the `Azkfile.js` is located), excluding CSS files and `config` folder. Plus, use shared folders to `tmp` and `log`.

  ```js
  mounts: {
    '/azk/#{manifest.dir}'      : sync('.', except: ['*.css', 'config/']),
    '/azk/#{manifest.dir}/tmp'  : persistent('tmp/'),
    '/azk/#{manifest.dir}/log'  : persistent('log/'),
  },
  ```
