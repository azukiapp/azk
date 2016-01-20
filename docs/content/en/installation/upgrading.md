# Upgrading azk

1. [Upgrading from azk >= 0.6.0](upgrading.html#upgrading-from-azk--060)
1. [Upgrading from azk <= 0.5.1](upgrading.html#upgrading-from-azk--051)

## Upgrading from azk >= 0.6.0

Once `azk` has been installed via packages the upgrade process becomes really simple:

### Express upgrade

!INCLUDE "express.md"

### Mac OS X

```bash
$ azk agent stop
$ brew update
$ brew upgrade azukiapp/azk/azk
```

### Linux

#### Ubuntu:

```bash
$ azk agent stop
$ sudo apt-get update
$ sudo apt-get install azk
```

#### Fedora:

```bash
$ azk agent stop
$ sudo yum upgrade azk
```

## Upgrading from azk <= 0.5.1

For users who tested and used `azk` in versions prior to` 0.6.0`, the upgrade process is not simple because of the incompatibility of the previous installation model with the installation package.

Before starting a new installation of `azk` you need to follow a few removal steps for previous versions:

1. **Warning:** `azk 0.6.0` has no backward compatibility. Persistent files, such as database information and installation of dependencies are removed, so go through the following procedure for backup:

  ```bash
  $ azk agent stop
  $ cp -Rf ~/.azk/data [path_to_backup]
  ```

2. For projects that were already using `azk`, you need to make an adjustment in ` Azkfile.js`. Basically replace `persistent_folders` and `mounts_folders` for the new option `mounts`, like the following example:

  Before version `0.6.0`:

    ```javascript
    systems({
      example: {
        // ...
        mounts_folders: { ".": "/azk/#{system.name}" },
        persistent_folders: [ "/data" ],
      }
    });
    ```

  After version `0.6.0`: (pay attention to the key position)

    ```javascript
    systems({
      example: {
        // ...
        mounts: {
          "/azk/#{system.name}": path("."),
          "/data": persistent("data"),
        },
      }
    });
    ```

3. When you run the command `start` on projects that you already used `azk`, add the extra option `--reprovision`, like the following example:

  ```bash
  $ azk start --reprovision
  ```

4. Now we can remove the previous installation of `azk` with the following commands:

  ```bash
  $ azk agent stop
  $ azk vm remove # mac only
  $ rm -Rf ~/.azk
  $ sudo rm /etc/resolver/azk.dev
  # and remove `~/.azk/bin` from your `$PATH`
  ```

5. Done, now you are able to install the new version of `azk`:

  * [Linux](linux.md#requirements)
  * [Mac OS X](mac_os_x.md#requirements)

!INCLUDE "../../links.md"
