## azk deploy

  Faz o deploy deste projeto em um servidor remoto.

#### Uso:

```bash
$ azk deploy (clear-cache|fast|full|restart|versions) [-vh]
$ azk deploy shell [--command=<cmd>] [-vh] [-- <args>...]
$ azk deploy ssh [-vh] [-- <args>...]
$ azk deploy rollback [<ref>] [-vh]
$ azk deploy [-vh]
```

#### Ações

```
  clear-cache               Limpa os dados de configuração do deploy armazenados em cache.
  fast                      Faz o deploy da aplicação sem configurar servidor remoto (é o padrão para as demais execuções do deploy).
  full                      Força a reconfiguração do servidor remoto (é o padrão executado no primeiro deploy).
  restart                   Reinicia a aplicação no servidor remoto.
  versions                  Lista todas as versões da aplicação "deployadas" no servidor remoto (retorna as versões e o título do commit em cada versão correspondente).
  shell                     Abre um terminal de dentro do container do sistema de deploy (ainda na máquina local do usuário).
  ssh                       Cria uma conexão SSH com o servidor remoto de destino da aplicação.
  rollback                  Reverte a aplicação para uma referência especificada (o padrão é a versão anterior).
```

#### Argumentos:

```
  ref                       Versão ou referência do git -- commit, branch etc.
```

#### Opções:

```
  --verbose, -v             Define o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0]..
  --help, -h                Mostrar ajuda de uso.
  --command=<cmd>, -c       Executa um comando específico.
```

#### Exemplos:

``` bash
$ azk deploy                                           # Executa `deploy fast`
$ azk deploy shell
$ azk deploy full
$ azk deploy fast
$ azk deploy versions
$ azk deploy rollback                                  # reverte para a versão anterior
$ azk deploy rollback v2                               # reverte para a versão v2
$ azk deploy rollback feature/add                      # reverte para o branch feature/add
$ azk deploy rollback 880d01a                          # reverte para o commit 880d01a
$ azk deploy restart
```
