## Nome de sistema

Nomear sistemas tem a seguinte restrição como RegExp:

```
[a-zA-Z0-9-]
```

Ela segue a convenção de nomes de contêiners do Docker. A única exceção é que nós não permitimos o uso do caractere `_`. Isso acontece porque o `azk` utiliza o nome de contêiners para "anotar" algumas informações, e nós utilizamos o caracter `_` como um "separador". Caso você execute o comando `adocker ps -a` poderá ver que o nome de um contêiner do `azk` se parece com o seguinte:


```
dev.azk.io_type.daemon_mid.892a5f73fa_sys.azkdemo_seq.1_uid.0bed3aa0c3
```

##### Exemplos:

```
systems({
  system-name: {

  }
})
```

```
systems({
  system01: {

  }
})
```