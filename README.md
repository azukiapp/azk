# libnss_resolver

A Linux extension that adds support the `/etc/resolver/*`,a means to support different "nameserver"
to specific suffixes, in a similar fashion to that which is supported on Mac OS X.

This is still a work in progress!

## Installing

### From package

Coming soon...

### From the source

First: install https://azk.io.

And after that:

```bash
$ git clone https://github.com/azukiapp-samples/nss_resolver
$ cd resolver-nss
# build
$ azk shell build -t -c "scons"

# Run tests
$ azk start dns # Run a mock dns server to test
$ azk shell build -t -c "./build/test"

# Install local
$ azk shell --mount /usr/lib:/azk/lib -c "scons install"
```

Now you can add the resolver-nss in resolution pipe:

```bash
$ sudo sed -i -re 's/^(hosts: .*$)/\1 resolver/' /etc/nsswitch.conf
```

or edit `/etc/nsswitch.conf`:

```bash
# Normally       ↓
hosts: files dns resolver
# But, if you have avahi (Zeroconf) installed          ↓
hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4 resolver
```

## References

Inspiration code: https://github.com/danni/docker-nss
Mac OS X resolver feature: [https://developer.apple.com/library/...](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/resolver.5.html)
Simple c-ares example: https://gist.github.com/mopemope/992777
Use a dns server in c-ares: https://github.com/bagder/c-ares/blob/master/adig.c
Ip and port format: https://sourceware.org/bugzilla/show_bug.cgi?id=14242
Use blocks in linux: http://mackyle.github.io/blocksruntime/

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013-2014 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.
