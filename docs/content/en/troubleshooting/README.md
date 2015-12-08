# Troubleshooting

> Just in case this troubleshooting could not help you to fix your problem, you can always get support from Azuki team at Gitter: https://gitter.im/azukiapp/azk/.

1. [I can't access any URL *.azk.dev.io](README.html#i-cant-access-any-url-azkdevio)

1. [The `azk start` command is not working](README.html#the-azk-start-command-is-not-working)

1. [I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?](README.html#im-experiencing-slowness-when-running-an-application-with-azk-in-my-mac-what-might-be-the-cause)

1. [There's no Internet available / I'm not connected to any network. `azk` starts but the browser shows I'm offline. How do I fix it?](README.html#theres-no-internet-available--im-not-connected-to-any-network-azk-starts-but-the-browser-shows-im-offline-how-do-i-fix-it)

1. [How can I clean Docker data?](README.html#how-can-i-clean-docker-data)

1. [How can I clean the `persistent` and `sync` folders from a specific project?](README.html#how-can-i-clean-the-persistent-and-sync-folders-from-a-specific-project)

1. [How can I clean all `persistent` and `sync` folders from all projects?](README.html#how-can-i-clean-all-persistent-and-sync-folders-from-all-projects)

1. [I'm facing `[sync] fail Error: watch ENOSPC` error when trying to start my system. How to fix it?](README.html#im-facing-sync-fail-error-watch-enospc-error-when-trying-to-start-my-system-how-to-fix-it)

-------------------------

### I can't access any URL *.azk.dev.io

During the instalation process, azk creates a file inside `/etc/resolver/` called `azk.dev.io`. This file is responsible for resolving every URL in the format *.azk.dev.io. In case this is not working, follow these steps:

1. Check that the resolver is configured with `scutil --dns`:

   ```sh
   $ scutil --dns
   ...
   resolver #3
      domain : azk.dev.io
      nameserver[0] : 192.168.50.4
   ```

2. If it's not listed in the output, check that the file `azk.dev.io` was created:

   ```sh
   $ cd /etc/resolver
   $ cat dev.azk.io
   # azk agent configure
   nameserver 192.168.50.4.53
   ```

3. In case it was created, restart your computer. It really helps!

4. If it still doesn't work, try turning off and on your computer's AirPort (Mac OS X).

5. Verify that port forwarding is enabled in the system firewall (Mac OS X Mavericks):

   ```sh
   $ sysctl -w net.inet.ip.fw.enable=1
   ```

6. Yosemite Note: If this still doesn't work, enable port forwarding manually:

   ```sh
   $ sudo pfctl -f /etc/pf.conf; sudo pfctl -e
   ```

Thanks to [pow](https://github.com/basecamp/pow/wiki/Troubleshooting#dns) for the troubleshooting tips. :)


----------------------------------

### The `azk start` command is not working

Sometimes it's a corrupted database. Sometimes it's the application files. The common solutions can vary from a simple restart to a total Docker image cleanup.

Here are some steps to get your `Azkfile.js` back to work again:

#### Restart azk agent

When you restart the agent you restart the load balancer and the DNS too.

```sh
$ azk agent stop
$ azk agent start
```

#### Restart the system(s)

Stop and start your system:

```sh
$ azk restart <system_name>
# or
$ azk stop  <system_name>
$ azk start <system_name>
```

#### Reprovision the system(s)

Stop and start your system with 'reprovision':

```sh
$ azk restart -R <system_name>
# or
$ azk stop <system_name>
$ azk start -R <system_name>
```

#### Check if your start command is correct

Check if your system is properly configured. This means the `command` set by the main system in the Azkfile.js should be successfully run.

##### Run the `command` from inside the azk shell

Get into azk shell and run the `command` instruction from Azkfile.js:

```sh
$ azk shell <system_name>

# for example in a Node.js container you can run:
$ npm start
```

##### Check if the server is bound to the Network Interface `0.0.0.0`

If the command in the previous step has been successfully run and your system runs a server (i.e. is a web system), ensure it is bound to the correct Network Interface (`0.0.0.0`, not `localhost` nor `127.0.0.1`, commonly set by default). To do this, check the server options and look for `bind` or `host` options, using the value `0.0.0.0`.

#### Check the logs

Check logs to get more information about errors:

```sh
$ azk logs <system_name>
```

#### Azkfile.js: replace `sync` by `path`

Edit your `Azkfile.js` and replace `sync` mounts with `path` mounts. The `path` option is slower but is more stable.

```js
// from
mounts: {
  '/azk/#{manifest.dir}': sync("."),
},

// to
mounts: {
  '/azk/#{manifest.dir}': path("."),
},
```


#### Azkfile.js: clean `persistent` and `sync` folders

You can check [this section](http://docs-azk.dev.azk.io/en/troubleshooting/README.html#how-can-i-clean-the-persistent-and-sync-folders-of-a-specific-project) on how to wipe off persisted data and get your system back to its initial state.

#### Dockerfile

Check your `Dockerfile`. Maybe some environment variable is not set.

#### Azkfile.js

Check your `Azkfile.js` against older versions. Has something changed? Did it work before? See some examples at http://images.azk.io/. Read carefully the azk documentation: [Azkfile.js](../azkfilejs/README.html).

-------------------------

### I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?

This is a known issue, caused when you use `path` mount option with your project folder. To solve this, simply change the `path` option to `sync` in your Azkfile.js.

We strongly recommend you to read the [`mounts` section](/en/reference/azkfilejs/mounts.html) of Azkfile.js documentation.

-------------------------

### There's no Internet available / I'm not connected to any network. `azk` starts but the browser shows I'm offline. How do I fix it?

This issue is Mac OS X-related only. In Linux-based OSes, `azk` should work either if Internet is available or not.

Once there's no Internet available, the DNS resolution fails including `azk` domains. In order to overcome this you can set `azk` domains in your `/etc/hosts` file.

Assuming your app domain is `demoazk.dev.azk.io` and your `azk` IP is `192.168.51.4` (run `azk doctor` to get this information), run the following command to add the proper configuration at the bottom of your `/etc/hosts` file:

```bash
$ echo "192.168.51.4 demoazk.dev.azk.io #azk" | sudo tee -a /etc/hosts
```

You must add an entry for each application that you are running using `azk`: `demoazk.dev.azk.io`, `blog.dev.azk.io`, `myapp.dev.azk.io` and `*.dev.azk.io`

Just keep in mind to remove those lines after you have Internet connection again. If you used the previous command, just run:

```bash
$ sed '/^.*#azk$/ { N; d; }' /etc/hosts
```

-------------------------

### How can I clean Docker data?

#### Killing running containers

To kill all running containers (you'll have to restart the `azk agent`):

```bash
adocker kill $(adocker ps -q | tr '\r\n' ' ')
```

#### Cleaning stopped containers

To delete stopped containers:

```bash
adocker rm -f $(adocker ps -f status=exited -q | tr '\r\n' ' ')
```

#### Removing Docker images

To remove Docker images using filters (in this example the filter is 'azkbuild'):

```bash
$ adocker rmi $(adocker images | grep "azkbuild" | awk '{print $3}' | tr '\r\n' ' ')
```

#### Removing Docker dangling images

To delete dangling images:

```bash
$ adocker rmi $(adocker images -q -f dangling=true | tr '\r\n' ' ')
```

#### Removing all Docker images (proceed with caution!)

The following command deletes **all** Docker images downloaded.
After running it, in the next execution you will have to download
all required images.

```bash
$ adocker rmi $(adocker images -q | tr '\r\n' ' ')
```

#### Other tips

The following link has several Docker tips.
Just be sure to run all commands as `adocker`,
especially if you are using a Virtual Machine.

- https://github.com/wsargent/docker-cheat-sheet#tips

----------------------

### How can I clean the `persistent` and `sync` folders from a specific project?

**WARNING:** This will clean the `persistent` and `sync` folders of a project.
This means all persisted data (including databases) for that project will be lost forever. **Proceed with extreme caution**.

1) Check the `persistent` and `sync` folders of the system:

```sh
$ azk info | grep -P "(persistent|sync)_folders"
```

2) Remove those folders:

#### Mac OS X

```sh
$ azk vm ssh -- sudo rm -rf ".../persistent_folders/0x0x0x0x0x0x"
$ azk vm ssh -- sudo rm -rf ".../sync_folders/0x0x0x0x0x0x"
# ...
```

#### Linux

```sh
$ sudo rm -rf ".../persistent_folders/0x0x0x0x0x0x"
$ sudo rm -rf ".../sync_folders/0x0x0x0x0x0x"
# ...
```

3) Restart system with reprovision flag (`-R`):

```sh
$ azk stop
$ azk start -R
```

----------------------

### How can I clean **all** `persistent` and `sync` folders from all projects?

**WARNING:** This will clean all `persistent` and `sync` folders. This means all persisted data (including databases) from all projects will be lost forever. **Proceed with extreme caution**.

After doing this you'll need to run `azk start -R` to reprovision each system.

#### Mac OS X

You can erase the `persistent_folder` and the `sync_folder` from inside the Virtual Machine.
Let's check those folders disk usage:

```sh
azk vm ssh -- du -sh /mnt/sda1/azk/persistent_folders
azk vm ssh -- du -sh /mnt/sda1/azk/sync_folders
```

Then you can remove **all** persistent and sync folders:

```sh
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/persistent_folders
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/sync_folders
```

#### Linux

You can erase `persistent_folder` and `sync_folder`.
Let's check this folders disk usage:

```sh
sudo du -hs ~/.azk/data/persistent_folders
sudo du -hs ~/.azk/data/sync_folders
```

Then you can remove **all** `persistent` and `sync` folders:

```sh
sudo rm -rf ~/.azk/data/persistent_folders
sudo rm -rf ~/.azk/data/sync_folders
```

----------------------

### How to delete the VM data disk (Mac OS X only)?

**WARNING:** After doing this procedure, **all** Docker images, containers, `persistent` and `sync` folders will be lost. This also means that **all** persisted data (including databases) from **all projects** will be lost forever. **Proceed with extreme caution**.

#### Mac OS X

```sh
rm -rf ~/.azk/data/vm/azk-agent.vmdk
rm -rf ~/VirtualBox VMs/azk-vm-dev.azk.io
```

----------------------

### I'm facing `[sync] fail Error: watch ENOSPC` error when trying to start my system. How to fix it?

Probably you have a system that uses the `sync` mount option in your Azkfile.js. This issue is related with the OS limitation on how many files an user can watch at the same time. The solution is simply increase this limit.

### Linux

#### Ubuntu or Fedora

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

#### Arch Linux

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.d/99-sysctl.conf && sudo sysctl --system
```
