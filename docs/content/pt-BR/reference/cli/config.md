## azk config

Controla as opções de configuração do azk.

#### Uso:

    $ azk config (list|reset|track-toggle|crash-report-toggle|email-set|email-never-ask-toggle) [options]

#### Ações:

```
  list                      Exibe todas configurações
  reset                     Limpa todas configurações de usuário
  track-toggle              Ativa/Desativa o rastreamento.
  crash-report-toggle       Ativa/Desativa o envio de erros
  email-set                 Configura e salva o email do usuário.
  email-never-ask-toggle    Ativa/Desativa a pergunta por email
```

#### Argumentos:

Para valores booleanos passados no argumento `config-value` várias opções podem ser utilizadas:

- *true*: on, true, 1
- *false*: off, false, 0
- *no set*: undefined, null

```
  config-value              Valor passado para a configuração (on/off/null)
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

----------

```sh
$ azk config crash-report-toggle
azk: Currently azk is automatically sending crash-reports.
? Send automatically bug reports when new errors occurs?
  1) Enable: always send error reports
  2) Disable: never send error reports
  3) Clear: clean configuration. Will ask user next time an error occurs
  Answer: 1

azk: Currently azk is automatically sending crash-reports.

# Ou configurar diretamente
$ azk config crash-report-toggle on
$ azk config crash-report-toggle off
$ azk config crash-report-toggle true
$ azk config crash-report-toggle false
$ azk config crash-report-toggle null
$ azk config crash-report-toggle undefined

```

----------

```sh
# configurar com interação do usuário
$ azk config email-set
azk: Current email: bar@foo.com
? What is your email [optional]? foo@bar.com
azk: Email saved: foo@bar.com

# configurar diretamente
$ azk config email-set bar@foo.com
azk: Current email: foo@bar.com
azk: Email saved: bar@foo.com

# evita que o email seja perguntado
$ azk config email-never-ask-toggle false
azk: Will ask for user email: not set
azk: Will ask for user email: false
```
