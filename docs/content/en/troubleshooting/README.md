# Troubleshooting

1. [I can't access any URL *.azk.dev.io](README.html#i-cant-access-any-url-azkdevio)

1. [The `azk start` command is not working](README.html#the-azk-start-command-is-not-working)

1. [I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?](README.html#im-experiencing-slowness-when-running-an-application-with-azk-in-my-mac-what-might-be-the-cause)

1. [There's no Internet available / I'm not connected to any network. `azk` starts but the browser shows I'm offline. How do I fix it?](README.html#theres-no-internet-available--im-not-connected-to-any-network-azk-starts-but-the-browser-shows-im-offline-how-do-i-fix-it)

1. [My HD has no more free space. How can I clean my old or stoped containers? What about Docker images?](README.html#my-hd-has-no-more-free-space-how-can-i-clean-my-old-or-stoped-containers-what-about-docker-images)

-------------------------


### I can't access any URL *.azk.dev.io

During the instalation process, azk creates a file inside `/etc/resolver/` called `azk.dev.io`. This file is responsible for resolving every URL in the format *.azk.dev.io. In case this is not working, follow these steps:

1. Check that the resolver is configured with scutil --dns:

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

4. If it still doesn't work, try turning off and on your computer's AirPort.

5. Verify that port forwarding is enabled in the system firewall (OS X Mavericks):

   ```sh
   $ sysctl -w net.inet.ip.fw.enable=1
   ```

6. Yosemite Note: If this still doesn't work, enable port forwarding manually:

   ```sh
   sudo pfctl -f /etc/pf.conf; sudo pfctl -e
   ```

Thanks to [pow](https://github.com/basecamp/pow/wiki/Troubleshooting#dns) for the troubleshooting tips. :)


----------------------------------

### The `azk start` command is not working.

Sometimes was a corrupted database. Sometimes was the application files. The common solutions can vary from a simple restart to a total Docker image cleanup.

Here there are some steps to get your `Azkfile.js` to work again:

#### restart agent

When you restart agent you restart balancer and DNS too.

```sh
azk agent stop
azk agent start
```

#### restart system(s)

Stop and start your system:

```sh
azk restart <system_name>
# or
azk stop  <system_name>
azk start <system_name>
```

#### reprovision system(s)

Stop and start your system with 'reprovision'.

```sh
azk restart -R <system_name>
# or
azk stop <system_name>
azk start -R <system_name>
```

#### checking logs

Check logs to get more information about errors.

```sh
azk logs <system_name>
```

#### execute Azkfile.js `command` on azk shell

Get into azk shell and run your `command: ` Azkfile.js instruction yourself:

```sh
azk shell <system_name>

# for example in a node.js container you can run:
$> npm start
```

#### Azkfile: replace sync by path

Edit your `Azkfile.js` and change `sync mounts` with `path mounts`. The `path` option is slower but is older and more stable.

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


#### Azkfile: clean persistent folders

1) Check persistent folders

```sh
azk info
```

2) Remove folders ..../persistent_folders/0x0x0x0x0x0x from systems that is getting errors to start

```sh
sudo rm -rf ".../persistent_folders/0x0x0x0x0x0x"
sudo rm -rf ".../persistent_folders/1x1x1x1x1x1x"
...
```

3) Restart systems with reprovision

```sh
azk stop
azk start -R
```

#### VM (Mac or Linux + VM) - clean all persistent_folders e sync_folders (caution!)

This will clean all `persistent_folders` and `sync_folders` inside VM.
All data persisted will be lost forever. Every database persistent data will be lost forever.

```sh
# caution -- All data persisted will be lost forever
azk vm ssh -- sudo rm -rf /mnt/sda1/azk
```

#### Linux - clean all persistent_folders and sync_folders (caution!)

This will clean all `persistent_folders` and `sync_folders`.
All data persisted will be lost forever. Every database persistent data will be lost forever.

```sh
# caution -- All data persisted will be lost forever
sudo rm -rf ~/.azk/data/sync_folders
sudo rm -rf ~/.azk/data/persistent_folders
```

#### Dockerfile

Check your Dockerfile. Maybe an `environment variable` is not set.

#### Azkfile.js

Check your `Azkfile.js` against older versions. Worked before? See some examples at http://images.azk.io/. Reade carefully the azk documentation: ../azkfilejs/README.html.

Just in case you could not fix your problem to get up your systems you always can get support at Gitter: https://gitter.im/azukiapp/azk/.

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

You must add an entry for each application that you are running using `azk`: `azkdemo.dev.azio.io`, `blog.dev.azk.io`, `myapp.dev.azk.io` e `*.dev.azk.io`

Just keep in mind to remove that line after you have Internet connection again. If you used the previous command, just run:

```bash
$ sed '/^.*#azk$/ { N; d; }' /etc/hosts
```

-------------------------

### My HD has no more free space. How can I clean my old or stoped containers? What about Docker images?

#### Running Containers

To kill running containers:

```bash
adocker kill $(adocker ps -q | tr '\r\n' ' '); \
```

#### Stopped Containers

To delete stopped containers:

```bash
adocker rm -f $(adocker ps -f status=exited -q | tr '\r\n' ' ')
```

#### Docker Images

Remove images using filters. In this example the filter is 'azkbuild':

```bash
adocker rmi $(adocker images | grep "azkbuild" | awk '{print $3}' | tr '\r\n' ' ')
```

#### Dangling Images

To delete dangling images:

```bash
adocker rmi $(adocker images -q -f dangling=true | tr '\r\n' ' ')
```

#### Delete all images

The following command deletes all Docker images downloaded.
After that in the next execution you will have to download
all future images.

```bash
adocker rmi $(adocker images -q)
```

#### Other tips

The following link has several Docker tips.
Just be sure to run all commands as `adocker`,
especially if you are using a virtual machine.

- https://github.com/wsargent/docker-cheat-sheet#tips
