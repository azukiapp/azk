# libnss-resolver

A Linux extension that adds support the `/etc/resolver/*`, a means to support different "nameserver"
to specific suffixes, in a similar fashion to that which is supported on Mac OS X.

This is still a work in progress!

## Installing

### From package

Download and install the appropriate package for your Linux distribution [here](https://github.com/azukiapp/libnss-resolver/releases).

### From the source (with azk)

First: install [https://azk.io][azk].

And after that:

```bash
$ git clone git@github.com:azukiapp/libnss-resolver.git
# or
$ git clone https://github.com/azukiapp-samples/libnss-resolver
$ cd libnss-resolver

# build
# [so] options: ubuntu12, ubuntu14, fedora20
$ azk shell [so]

# run tests
$ azk start dns # Run a mock dns server to test
$ azk shell [so] -t -c "scons run-test"
# or debug
$ azk shell [so] -t -c "scons run-test -Q define=DEBUG"

# install local
$ azk shell [so] --mount /usr/lib:/azk/lib -c "scons install"
```

Now you can add the resolver-nss in resolution pipe:

```bash
$ sudo sed -i -re 's/^(hosts: .*$)/\1 resolver/' /etc/nsswitch.conf
```

or edit `/etc/nsswitch.conf`:

```bash
# normally       ↓
hosts: files dns resolver
# but, if you have avahi (Zeroconf) installed          ↓
hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4 resolver
```

### From the source (without azk)

Dependencies: scons and clang

```bash
$ git clone git@github.com:azukiapp/libnss-resolver.git
# or
$ git clone https://github.com/azukiapp-samples/libnss-resolver
$ cd libnss-resolver

# build
$ scons install
```

## Configuring

After install you can create a `sufix` zones in `/etc/resolver/`, like this:

```bash
$ echo "nameserver 127.0.0.1:5353" | sudo tee -a /etc/resolver/test.dev
```

A good way to test is to install dnsmasq:

```bash
$ sudo yum install dnsmasq
$ dnsmaqs -p 5353 --no-daemon --address=/test.dev/127.0.0.1
```

Now you can try this:

```bash
# ping sufix
$ ping test.dev 
# or any "subdomain"
$ ping any.test.dev
```

## Test and build (azk only)

This project uses clang to compile, scons as mounting and valgrind tool to analyze code and running.

But all these tools are available behind the [azk][azk], just the commands below to get a development environment:

```bash
$ azk start dns
# [so] options: ubuntu12, ubuntu14, fedora20
$ azk shell [so] -t -c "scons local-install"
```

After that, the following scons targets are available:

```bash
# to build and run testes
$ scons run-test -Q [define=DEBUG] [valgrind="valgrind options"]
# to install in azk instance
$ scons local-install
# and test with:
$ ping resolver.dev
```

## References

* Inspiration code: https://github.com/danni/docker-nss
* Mac OS X resolver feature: [https://developer.apple.com/library/...](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/resolver.5.html)
* Simple c-ares example: https://gist.github.com/mopemope/992777
* Use a dns server in c-ares: https://github.com/bagder/c-ares/blob/master/adig.c
* Ip and port format: https://sourceware.org/bugzilla/show_bug.cgi?id=14242
* Use blocks in linux: http://mackyle.github.io/blocksruntime/

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013-2014 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

[azk]: http://azk.io
