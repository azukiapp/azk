# FAQ

1. [Quais os requisitos para utilizar o azk?](README.html#quais-os-requisitos-para-utilizar-o-azk)
1. [Qual a diferença do azk para o docker-compose (Fig)?](README.html#qual-a-diferena-do-azk-para-o-docker-compose-fig)
1. [Qual a diferença do azk para o Vagrant, ou Chef?](README.html#qual-a-diferena-do-azk-para-o-vagrant-ou-chef)
1. [Meu programa está legal com azk. Existe alguma forma de fazer deploy do meu ambiente?](README.html#meu-programa-est-legal-com-azk-existe-alguma-forma-de-fazer-deploy-do-meu-ambiente)
1. [Dentro do Azkfile.js, qual a diferença entre image, provision e command?](README.html#dentro-do-azkfilejs-qual-a-diferena-entre-image-provision-e-command)
1. [Por que devo utilizar as imagens sugeridas pelo azk init?](README.html#por-que-devo-utilizar-as-imagens-sugeridas-pelo-azk-init)
1. [A imagem sugerida pelo azk não está do jeito que eu gostaria, como devo proceder?](README.html#a-imagem-sugerida-pelo-azk-no-est-do-jeito-que-eu-gostaria-como-devo-proceder)
1. [Não acho a imagem que gostaria no Docker Hub, o que faço agora?](README.html#no-acho-a-imagem-que-gostaria-no-docker-hub-o-que-fao-agora)
1. [Por que quando eu mudo de pastas não vejo mais os sistemas levantados com o comando azk status?](README.html#por-que-quando-eu-mudo-de-pastas-no-vejo-mais-os-sistemas-levantados-com-o-comando-azk-status)
1. [Qual a vantagem de se utilizar vários sistemas, cada um num container separado?](README.html#qual-a-vantagem-de-se-utilizar-vrios-sistemas-cada-um-num-container-separado)
1. [Já utilizei várias imagens com o azk que não utilizo mais. Elas estão ocupando muito espaço em disco. Como faço para limpar?](README.html#j-utilizei-vrias-imagens-com-o-azk-que-no-utilizo-mais-elas-esto-ocupando-muito-espao-em-disco-como-fao-para-limpar)
1. [Como crio uma aplicação (node, ruby, rails, etc), sem ter a linguagem ou framework instalados na minha máquina?](README.html#como-crio-uma-aplicao-node-ruby-rails-etc-sem-ter-a-linguagem-ou-framework-instalados-na-minha-mquina)
1. [Estou com problemas de completion e encoding dentro do azk shell. Como resolvo?](README.html#estou-com-problemas-de-completion-e-encoding-dentro-do-azk-shell-como-resolvo)

##### Quais os requisitos para utilizar o azk?

Linux:
- Docker

Mac:
- Virtualbox

Ao executar o azk no Mac, você não precisa instalar o Docker manualmente já que nós cuidamos disso. Nesse caso você tem acesso ao docker no terminal através do comando `adocker`. Pelo fato do Linux não precisar de uma máquina virtual para executar o azk, a performance nele é superior a alcançada no Mac.

##### Qual a diferença do azk para o docker-compose (Fig)?

- O `azk` não é um orquestrador focado apenas em Docker, apesar de suportar somente Docker no momento.
- O `azk` possui um balanceador de carga integrado
- O `azk` possui um DNS integrado com a [libnss-resolver](https://github.com/azukiapp/libnss-resolver), permitindo que o usuário acesse URLs personalizadas e não apenas portas do localhost.
- O `azk` possui o conceito de provisionamento, que permite que sejam executados comandos após a criação do container de forma automática, sem que seja necessária a alteração da imagem original.
- O `Azkfile.js` é feito utilizando JavaScript com estrutura própria;

##### Qual a diferença do azk para o Vagrant, ou Chef?

Explicando de uma forma sucinta:
- O `Vagrant` provê uma maneira de descrever e gerar máquinas virtuais idênticas (ou até mesmo containers recentemente). Ele pode trabalhar em conjunto com uma ferramenta de configuração de software (por exemplo Chef) para continuar o processo de setup de uma máquina, após a instalação do sistema terminar.
- `Chef`, como mencionado acima, é uma ferramenta para configuração de software. Ele vai ajudar a automatizar o processo de configuração de uma máquina, após ela ser levantada. Por exemplo: arquivos de configuração, programas instalados, usuários, entre outros recursos. Chef, como outros projetos similares, também ajuda no processo de orquestração para enviar mudanças no sistema para máquinas específicas.

O azk, assim como o Docker, se sobrepõe ao Vagrant e ao Chef em certos aspectos. Com o azk é possível definir como as aplicações/serviços que compõem o seu projeto se relacionam, e como o seu projeto deve ser executado. Isso é feito dentro do `Azkfile.js`, de uma forma clara e sucinta para facilitar a comunicação entre desenvolvimento e operações (DevOps), e tornar todo o processo de deployment algo transparente para ambos os times. Além disso, especificamente pelo uso de containers, testar as aplicações em desenvolvimento e produção se torna algo muito mais confiável e diminui as chances do famoso "mas funciona na minha máquina".

##### Meu programa está legal com azk. Existe alguma forma de fazer deploy do meu ambiente?

Estamos trabalhando numa solução de deploy. Aguardem. ;)

##### Dentro do Azkfile.js, qual a diferença entre image, provision e command?

O `image` define qual será a imagem binária do Docker que será utilizada como ponto de partida para montagem do sistema. O `provision` é executado na primeira vez que o sistema é levantado e o `command` define a forma de levantar o sistema para que ele seja exposto para o usuário, ou outro sistema.

##### Por que devo utilizar as imagens sugeridas pelo `azk init`?

As sugestões feitas pelo comando `azk init` são testadas pela equipe do `azk`. Elas seguem nossos padrões de qualidade para assegurar a integração e estabilidade com a nossa ferramenta, além de terem os Dockerfile's disponíveis para que você possa verificar tudo que está sendo instalado no sistema.

##### A imagem sugerida pelo azk não está do jeito que eu gostaria, como devo proceder?

Você pode encontrar imagens prontas em:
- [Repositório de imagens do Azuki](http://images.azk.io/)
- [Respositório de imagens do Docker](https://registry.hub.docker.com/)

##### Não acho a imagem que gostaria no Docker Hub, o que faço agora?

Nesse caso, a alternativa é criar o seu próprio Dockerfile para fazer o build da sua imagem, seguindo as instruções em:  https://docs.docker.com/reference/builder

Além disso, faz sentido utilizar seu próprio Dockerfile caso:

- Você saiba os requisitos exatos e únicos do ambiente de desenvolvimento necessário para sua aplicação.
- Você queira adicionar funcionalidades específicas do seu projeto a imagens existentes.
- Você precisa otimizar o tamanho de uma imagem comparado ao que está disponível atualmente.

##### Por que quando eu mudo de pastas não vejo mais os sistemas levantados com o comando `azk status`?

O comando `azk status` e seus irmãos (`start stop restart` e etc.) são relativos ao `Azkfile.js` da pasta atual ou pastas ascendentes (assim como o `.gitignore`, por exemplo). Quando se muda de pasta o `azk` entende que se deseja trabalhar em outro sistema. Por isso para que possamos executar um `azk stop` num sistema em que tenha sido executado o `azk start`, precisamos voltar a sua pasta.

##### Qual a vantagem de se utilizar vários sistemas, cada um num container separado?

Para responder essa questão, vale a pena ler sobre micro-serviços nesse ótimo artigo: http://martinfowler.com/articles/microservices.html

##### Já utilizei várias imagens com o azk que não utilizo mais. Elas estão ocupando muito espaço em disco. Como faço para limpar?

Você pode listar as imagens utilizando o comando:

```sh
# Mac
$ adocker images

# Linux
$ docker images
```

Para deletar uma imagem, basta executar:

```sh
# Mac
$ adocker rmi azukiapp/node:0.10

# Linux
$ docker rmi azukiapp/node:0.10
```

##### Como crio uma aplicação (node, ruby, rails, etc), sem ter a linguagem ou framework instalados na minha máquina?

Você pode criar um container utilizando a imagem da linguagem/framework que você quiser, acessá-lo utilizando o comando `azk shell [system]`, e criar sua aplicação dentro dele.

Exemplo de geração de uma aplicação rails:

```sh
$ azk shell --image azukiapp/ruby --shell /bin/bash
# gem install rails --no-rdoc --no-ri
# rails new my-app
# exit
```

##### Estou com problemas de completion e encoding dentro do `azk shell`. Como resolvo?

Por padrão, quando um `azk shell` é executado, o `/bin/sh` é utilizado para o terminal. Isto é feito porque não são todas as imagens que tem o `/bin/bash` instalado.

Se a imagem que você está utilizando tem o `/bin/bash` instalado edite o seu arquivo `Azkfile.js` e adicione a opção `shell: "/bin/bash"` para o seu system. Ou então, utilize a opção `--shell` no comando `azk shell`:

```shell
$ azk shell --shell=/bin/bash
```
