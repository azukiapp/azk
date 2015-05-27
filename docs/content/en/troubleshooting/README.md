# Troubleshooting

1. [I can't access any URL *.azk.dev.io](README.html#i-cant-access-any-url-azkdevio)
2. [I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?](README.html#im-experiencing-slowness-when-running-an-application-with-azk-in-my-mac-what-might-be-the-cause)
3. [There's no Internet available / I'm not connected to any network. `azk` starts but the browser shows I'm offline. How do I fix it?](README.html#theres-no-internet-available--im-not-connected-to-any-network-azk-starts-but-the-browser-shows-im-offline-how-do-i-fix-it)

#### I can't access any URL *.azk.dev.io

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

#### I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?

This is a known problem, and it happens because of the way that files are "shared" between the virtual machine (VirtualBox) and the host (Mac). We made some great improvements in azk's 0.10 version, but this problem might still happen especially with applications that have a lot of files, like rails applications, for example.

On Ruby on Rails applications specifically, you can turn off debug mode to get more performance. Just update config/environments/development.rb with:

```ruby
config.assets.debug = false
```

You can find more information regarding this setting [here](http://guides.rubyonrails.org/asset_pipeline.html#turning-debugging-off).

#### There's no Internet available / I'm not connected to any network. `azk` starts but the browser shows I'm offline. How do I fix it?

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
