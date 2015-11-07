## azk agent

Controla o serviço `azk agent`. Acesse a [documentação do agent](../../agent/README.md) para maiores informações.

#### Uso:

    $ azk agent (start|status|stop) [options]

#### Ações:

```
  start                     Inicia o agent do azk.
  status                    Exibi o agent do azk.
  stop                      Para o agent do azk.
```

#### Opções:

```
  --no-daemon               Executa o agent em primeiro plano (foreground).
  --no-reload-vm            Não recarregar as configurações da maquina virtual.
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

    $ azk agent start --no-daemon
