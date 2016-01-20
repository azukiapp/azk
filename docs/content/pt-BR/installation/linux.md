# Linux

!INCLUDE "warning.md"

## Requisitos

* **Distribuições (testadas)**: Ubuntu 12.04/14.04/15.04 e Fedora 20/21/22
* **Arquitetura**: 64-bits
* [Docker][docker] 1.8.1
* Não estar rodando nenhum serviço nas portas `80` e `53`

**Importante**: Se você estiver rodando algum serviço nas portas `80` e/ou `53` você deve customizar a configuração do `azk` definindo as seguintes variáveis `AZK_BALANCER_PORT` e `AZK_DNS_PORT` respectivamente, antes de executar o `azk agent start`.

## Instalando a versão mais recente do Docker

Existem duas formas de instalação do Docker:

1. Instalação expressa:

  ```bash
  $ curl -sSL https://get.docker.com/ | sh
  # ou
  $ wget -nv https://get.docker.com/ -O- -t 2 -T 10 | sh
  ```

2. Instalação manual:

  - [Ubuntu][docker_ubuntu_installation]
  - [Fedora][docker_fedora_installation]

## Dando acesso ao serviço do Docker para o seu usuário

O _daemon_ do Docker utiliza um _socket Unix_ ao invés de uma porta TCP. Por padrão, o _socket Unix_ pertence ao usuário root e outros usuários só podem acessá-lo com `sudo`. Por essa razão, o _daemon_ do Docker sempre é executado como usuário `root`.

Para evitar de sempre ter que usar `sudo` para os comandos do Docker, crie um grupo Unix chamado `docker` e adicione seus usuários a ele. Quando o _daemon_ é iniciado, ele permite ao grupo `docker` a leitura e escrita do _socket_ utilizado.

> **Aviso**: O grupo `docker` é equivalente ao usuário root; Para detalhes sobre como isso impacta a segurança do seu sistema, acesse [Docker Daemon Attack Surface][docker_daemon_attack_surface].

Para criar o grupo `docker` e adicionar seu usuário:

1. Faça login com um usuário com privilégio para rodar o sudo;

2. Crie o grupo `docker` e adicione seu usuário

  ```bash
  $ sudo usermod -aG docker $(id -un)
  ```

3. Faça logout e, em seguida, login

  Isso assegura que o usuário estará com as permissões corretas

4. Verifique se está funcionando rodando o Docker sem sudo

  ```bash
  $ docker run hello-world
  ```

  Se o comando anterior falhar, a mensagem deve ser similar a seguinte:

  ```bash
  Cannot connect to the Docker daemon. Is 'docker daemon' running on this host?
  ```

  Cheque se a variável de ambiente `DOCKER_HOST` está definida em seu ambiente. Se estiver, dê `unset` nela.

## Desabilite o serviço de dnsmasq (apenas para Ubuntu)

Em sistemas desktop executando Ubuntu ou algum dos seus derivados, há um serviço
de dns padrão (dnsmasq) que conflita com o serviço de dns que há embutido no azk.

Para resolver esse conflito é preciso parar o dnsmasq e garantir que ele não
será executado automaticamente no próximo login. Para isso execute os comandos:

  ```bash
  $ sudo service dnsmasq stop
  $ sudo update-rc.d -f dnsmasq remove
  ```

## Instalando o azk

### Instalação expressa

A forma mais fácil de instalar o `azk` é utilizar o script abaixo. Ele vai identificar o sistema operacional que está usando e, se for compatível, realizar todos os processos de instalação.

!INCLUDE "express.md"

### Ubuntu

1. Adicionando as chaves do Azuki ao seu keychain local:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

2. Adicione o repositório do Azuki a lista de sources do apt:

  ```bash
  # Ubuntu Precise (12.04)
  $ echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list

  # Ubuntu Trusty (14.04)
  $ echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list

  # Ubuntu Wily (15.10)
  $ echo "deb [arch=amd64] http://repo.azukiapp.com wily main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list
  ```

3. Atualize a lista de pacotes e instale o azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

4. Você pode [iniciar o agent](../getting-started/starting-agent.md) agora, porém, **tenha certeza de que o serviço do Docker está rodando**;

### Fedora

1. Adicione as chaves do Azuki ao seu keychain local:

  ```bash
  $ rpm --import \
    'http://repo.azukiapp.com/keys/azuki.asc'
  ```

2. Adicione o repositório do Azuki:

  ```bash
  $ echo "[azuki]
  name=azk
  baseurl=http://repo.azukiapp.com/fedora20
  enabled=1
  gpgcheck=1
  " > /etc/yum.repos.d/azuki.repo
  ```

3. Instale o `azk` e suas dependências:

  ```bash
  $ sudo yum install azk
  ```

4. Você pode [iniciar o agent](../getting-started/starting-agent.md) agora, porém, **tenha certeza de que o serviço do Docker está rodando**;

### Outras distribuições

Em breve...

!INCLUDE "../getting-started/banner.md"
!INCLUDE "../../links.md"
