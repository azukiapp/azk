# Troubleshooting

1. [I can't access any URL *.azk.dev.io](README.html#i-cant-access-any-url-azkdevio)
1. [I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?](README.html#im-experiencing-slowness-when-running-an-application-with-azk-in-my-mac-what-might-be-the-cause)

##### I can't access any URL *.azk.dev.io

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

##### I'm experiencing slowness when running an application with azk in my Mac. What might be the cause?

This is a known problem, and it happens because of the way that files are "shared" between the virtual machine (VirtualBox) and the host (Mac). We made some great improvements in azk's 0.10 version, but this problem might still happen especially with applications that have a lot of files, like rails applications, for example.
