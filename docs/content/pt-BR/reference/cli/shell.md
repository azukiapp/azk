## azk shell

  Inicializa um shell com o contexto da instância, ou executa um comando arbitrário.

#### Uso:

```
  azk shell [<system>] [options] [-- <shell-args>...]
```

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
  shell-args                Opções e argumetnos que serão passados para o sistema.
```

#### Opções:

```
  --command=<cmd>, -c       Executa o comando especificado.
  --cwd=<dir>, -C           Diretório de trabalho dentro do container.
  --image=<name>, -i        Defini a imagem a qual o comando será executado.
  --shell=<bin>             Caminho para o binário do shell.
  --rebuild, -B             Força a recriação ou o download da imagem antes de iniciar a instância.
  --no-remove, -r           Não remove a instância do container após a parada.
  --silent                  Impede a exibição das mensagens do comando em execução. É útil quando usado a opção `-c` e a saída é usada como entrada para outro comando utilizando o operador pipe `|`.
  --tty, -t                 Força o alocação de pseudo-tty.
  --no-tty, -T              Desativa a alicação de pseudo-tty.
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --mount=<paths>, -m       Adiciona pontos de montagens - suporta múltiplos (`-m ~/Home:/azk/user -m ~/data:/var/data`).
  --env=<data>, -e          Adiciona variáveis de ambiente - suporta múltiplos (`-e HTTP_PORT=5000 -e PORT=5000`).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```
azk shell --image azukiapp/debian --shell /bin/bash
azk shell --image azukiapp/debian --shell /bin/bash -c 'echo test'
azk shell --image azukiapp/debian --shell /bin/bash -- echo test
azk shell --mount ~/Home:/azk/user --env HOME=/azk/user --env HTTP_PORT=5000

# Inicia o sistema padrão do Azkfile.js utilizando o shell /bin/bash
azk shell --shell /bin/bash

# Inicia o sistema [system_name] montando a pasta / em /azk/root
#  dentro do container e definindo a variável de ambiente RAILS_ENV=dev
azk shell [system_name] --mount /:/azk/root -e RAILS_ENV=dev

# Executa o comando `ls` dentro do sistema [system_name]
azk shell [system_name] -c "ls -l /"

# Inicia um container a partir da imagem `azukiapp/azktcl:0.0.2` montando
#  e executando o comando /bin/bash, e forçando a alocação do pseudo-tty
azk shell --image azukiapp/azktcl:0.0.2 -t -c "/bin/bash"

# Executa um commando dentro do container e utiliza a saída como entrada
# para outro comando usando o operador pipe `|`. Note a opção `--silent`
# para evitar que `azk shell` exiba mensagens de log no output.
azk shell --silent -c "ls -al /" | grep home
```
