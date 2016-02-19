## azk vm

Controla a Maquina Virtual.

#### Uso:

```
  azk vm (ssh|start|status|installed|stop|remove) [options] [-- <ssh-args>...]
```

#### Ações:

```
  installed                 Checa se a maquina virtual está instalada.
  remove                    Remove a maquina virtual.
  start                     Inicia a maquina virtual.
  stop                      Para a maquina virtual.
  status                    Exibe o status da maquina virtual.
  ssh                       Acessa a maquina virtual através do protocolo SSH.
```

#### Argumentos:

```
  ssh-args                  Opções ou argumentos que serão passados para a maquina virtual através do ssh.
```

#### Opções:

```
  --force, -F               Ativa o forçamento.
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```
