## azk docker

  _Alias_ for calling docker in azk configuration scope of `azk`.

#### Usage:

```
$ azk docker [options] [-- <docker-args>...]
```

#### Arguments:

```
  docker-args               Options and arguments to be passed to Docker.
```

#### Options:

```
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Example:

```
$ azk docker -- images
REPOSITORY               TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
azukiapp/ngrok           latest              5815b394184f        46 hours ago        23.74 MB
azukiapp/postgres        9.3                 771980fc031d        5 days ago          213 MB
redis                    latest              0f3059144681        7 days ago          111 MB
azukiapp/elixir          latest              1fb7ad9cdb2f        11 days ago         722.1 MB
azukiapp/erlang          latest              d7bac40697e3        11 days ago         711.9 MB
azukiapp/node            0.12                e468894e1308        11 days ago         900.8 MB
```

```
$ azk docker -- ps
CONTAINER ID        IMAGE                   COMMAND                CREATED             STATUS              PORTS                             NAMES
af8d6faa53cb        azukiapp/azktcl:0.0.2   "/bin/bash -c 'env;    54 minutes ago      Up 54 minutes       53/udp, 192.168.51.4:80->80/tcp   dev.azk.io_type.daemon_mid.345dada3aa_sys.balancer-redirect_seq.1_uid.b34a6aa011
884dbe428903        azukiapp/azktcl:0.0.2   "/bin/bash -c 'dnsma   54 minutes ago      Up 54 minutes       192.168.51.4:53->53/udp, 80/tcp   dev.azk.io_type.daemon_mid.345dada3aa_sys.dns_seq.1_uid.b2fb875011
```
