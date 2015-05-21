## System Name

Naming systems has the following RegExp restriction:

```
[a-zA-Z0-9-]
```

It follows the naming conventions for Docker containers names. The only exception is that we don't allow the character `_` to be used. That is because `azk` uses the container name to "annotate" some pieces of information, and we use the character `_` as the separator. If you run the command `adocker ps -a` you might see that `azk` container names might look something like this:

```
dev.azk.io_type.daemon_mid.892a5f73fa_sys.azkdemo_seq.1_uid.0bed3aa0c3
```

Also, if you use `-` in your system's name, you must enclose it in quotes.

##### Examples:

```
systems({
  "system-name": {

  }
})
```

```
systems({
  system01: {

  }
})
```