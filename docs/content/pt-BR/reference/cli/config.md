## azk config

Controla as opções de configuração do azk.

#### Uso:

    $ azk config (list|set|reset) [options]

#### Ações:

```
  list                      Exibe todas configurações
  set                       Define chave/valor
  reset                     Limpa todas configurações de usuário
```

#### Argumentos:

Para valores booleanos passados no argumento `config-value` várias opções podem ser utilizadas:

- *true*: on, true, 1
- *false*: off, false, 0
- *no set*: undefined, null, none, blank, reset

```
  config-value              Valor passado para a configuração (on/off/null)
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

```sh
# veja todas configurações
$ azk config list
{ 'user.email': undefined,
  'user.email.always_ask': undefined,
  'user.email.ask_count': undefined,
  'terms_of_use.accepted': true,
  'terms_of_use.ask_count': 1,
  'crash_reports.always_send': undefined,
  tracker_permission: undefined }

# defina seu email
$ azk config set user.email foo@bar.com
azk: `user.email` was set to `foo@bar.com`

# verifique seu email
$ azk config list user.email
{ 'user.email': 'foo@bar.com' }
```
