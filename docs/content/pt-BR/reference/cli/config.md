## azk config

Controla as opções de configuração do azk.

#### Uso:

    $ azk config (track-toggle|track-status) [options]

#### Ações:

```
  track-toggle              Ativa/Desativa o rastreamento.
  track-status              Exibe o status de rastreamento (on or off).
```

#### Opções:

```
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```
$ azk config track-status
azk: currently azk is tracking data, more info: https://github.com/azukiapp/azk and http://docs.azk.io/en/terms-of-use

$ azk config track-status
azk: currently azk is not tracking any data

$ azk config track-toggle
azk: currently azk is tracking, more info: https://github.com/azukiapp/azk and http://docs.azk.io/en/terms-of-use
? =========================================================================
  We're constantly looking for ways to make azk better!
  May we anonymously report usage statistics to improve the tool over time?
  More info: https://github.com/azukiapp/azk & http://docs.azk.io/en/terms-of-use
 =========================================================================
(Y/n) Yes
azk: cool! Thanks for helping us make azk better :)
```
