## azk docker

  _Alias_ para chamar o docker no contexto de configuração do `azk`.

#### Uso:

    $ azk docker [options] [-- <docker-args>...]

#### Argumentos:

```
  docker-args               Opções ou argumentos passados para o Docker.
```

#### Opções:

```
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```
$ azk docker -- images
REPOSITORY               TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
azukiapp/ngrok           latest              5815b394184f        46 hours ago        23.74 MB
azukiapp/postgres        9.3                 771980fc031d        5 days ago          213 MB
redis                    latest              0f3059144681        7 days ago          111 MB
azukiapp/elixir          latest              1fb7ad9cdb2f        11 days ago         722.1 MB
azukiapp/erlang          latest              d7bac40697e3        11 days ago         711.9 MB
azukiapp/node            0.12                e468894e1308        11 days ago         900.8 MB

$ azk docker -- ps
CONTAINER ID        IMAGE                   COMMAND                CREATED             STATUS              PORTS                             NAMES
af8d6faa53cb        azukiapp/azktcl:0.0.2   "/bin/bash -c 'env;    54 minutes ago      Up 54 minutes       53/udp, 192.168.51.4:80->80/tcp   dev.azk.io_type.daemon_mid.345dada3aa_sys.balancer-redirect_seq.1_uid.b34a6aa011
884dbe428903        azukiapp/azktcl:0.0.2   "/bin/bash -c 'dnsma   54 minutes ago      Up 54 minutes       192.168.51.4:53->53/udp, 80/tcp   dev.azk.io_type.daemon_mid.345dada3aa_sys.dns_seq.1_uid.b2fb875011
```
