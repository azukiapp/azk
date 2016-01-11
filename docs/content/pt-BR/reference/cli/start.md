## azk start

  Inicia um ou mais sistemas.

#### Uso:

```
  azk start [<system>] [options]
```

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
  git-repo                  Github URL para clonar and iniciar
  dest-path                 Pasta destino que será clonado o repositório do Github
```

#### Opções:

```
  --reprovision, -R         Força o provisionamento do sistema antes de iniciar a instância.
  --rebuild, -B             Força a recriação ou o download da imagem antes de iniciar a instância.
  --open, -o                Abre a URL do sistema no navegador padrão.
  --open-with=<app>, -a     Abre a URL do sistema no navegador espeficado.
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
  --git-ref=<git-ref>       branch, tag ou commit para clonar no Git
```

#### Exemplos:

##### inicia o sistema azkdemo e abre o browser padrão

```bash
$ azk start azkdemo --open
```

##### inicia o azkdemo à partir do Github

Todos os exemplos abaixo fazem a mesma coisa: clonam e iniciam o repositório `azkdemo` diretamente do Github na branch `final` para pasta `/tmp/azkdemoDest`.

```bash
# assim
azk start git@github.com:azukiapp/azkdemo.git /tmp/azkdemoDest --git-ref final

# ou assim
azk start https://github.com/azukiapp/azkdemo.git /tmp/azkdemoDest --git-ref final

# ou assim
azk start azukiapp/azkdemo /tmp/azkdemoDest --git-ref final

# ou assim
azk start azukiapp/azkdemo#final /tmp/azkdemoDest
```
