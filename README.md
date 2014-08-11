resolver-nss
==========

A libnss plugin for add support `/etc/resolver/*` to set extra nameservers like a Mac OS X.

This is still a work in progress!

Installing
==========

```bash
$ git clone https://github.com/azukiapp-samples/resolver-nss
$ cd resolver-nss
$ sudo make all install
$ sudo sed -i -re 's/^(hosts: .*$)/\1 resolver/' /etc/nsswitch.conf
```

or edit `/etc/nsswitch.conf`:

```bash
# Normally
hosts:      files dns resolver
                      ^
# If you have avahi installed
files mdns4_minimal [NOTFOUND=return] dns mdns4 resolver
                                                ^
```

Inspiration
===========

This project is inspiration in similar [feature][mac_resolver] that is present in Mac OS X.

The code was based on another project code: [docker nss][docker_nss].

Todo
====

  * Add support `/etc/resolver/*` files
  * Refactor tests

License
=======

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013-2014 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

[mac_resolver]: https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/resolver.5.html
[docker_nss]: https://github.com/danni/docker-nss
