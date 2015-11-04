# Linux

> A forma mais simples de instalar o azk é seguindo a seção [Instalação expressa do azk](./README.html#instalao-expressa-do-azk)

!INCLUDE "warning.md"

## Requisitos

* Distribuições (testadas): Ubuntu 12.04/14.04/15.04 e Fedora 20/21/22/23
* Arquitetura: 64-bits
* [Docker][docker] 1.8.1
* Não estar rodando nenhum serviço nas portas `80` e `53`

**Importante**: Se você estiver rodando algum serviço nas portas `80` e/ou `53` você deve customizar a configuração do `azk` definindo as seguintes variáveis `AZK_BALANCER_PORT` e `AZK_DNS_PORT` respectivamente, antes de executar o `azk agent start`.

## Ubuntu Precise (12.04), Trusty (14.04) and Wily (15.04) (todas 64-bit)

1. Instale o Docker:

  - Instale a versão mais recente do Docker [**docker-engine**][docker_ubuntu_installation]. Observe que no final das instruções, eles dispõem um `script curl` para facilitar a instalação.
  - Inclua seu usuário local no [grupo docker][docker_ubuntu_root_access]; Faça um _logoff_ para que as configurações de grupo de usuários sejam ativadas;
  - [Desabilite o uso de dnsmasq][docker_ubuntu_dns];
  - Pare o serviço do dnsmasq e garanta que ele não será iniciado automaticamente após o login:

    ``` bash
    $ sudo service dnsmasq stop
    $ sudo update-rc.d -f dnsmasq remove
    ```

2. Adicionando as chaves do Azuki ao seu keychain local:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

3. Adicione o repositório do Azuki a lista de sources do apt:

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

4. Atualize a lista de pacotes e instale o azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

5. Você pode [iniciar o agent](../getting-started/starting-agent.md) agora, porém, **tenha certeza de que o serviço do Docker está rodando**;

## Fedora 20, 21, 22 e 23

1. Adicione as chaves do Azuki ao seu keychain local:

  ```bash
  $ rpm --import \
    'http://repo.azukiapp.com/keys/azuki.asc'
  ```

2. Adicione o repositório do Azuki:

  ```bash
  # Fedora 20, 21 e 22
  $ echo "[azuki]
  name=azk
  baseurl=http://repo.azukiapp.com/fedora20
  enabled=1
  gpgcheck=1
  " > /etc/yum.repos.d/azuki.repo

  # Fedora 23
  $ echo "[azuki]
  name=azk
  baseurl=http://repo.azukiapp.com/fedora23
  enabled=1
  gpgcheck=1
  " > /etc/yum.repos.d/azuki.repo
  ```

3. Instale o `azk` e suas dependências:

  ```bash
  $ sudo yum install azk
  ```

4. Inclua seu usuário local no [grupo docker][docker_fedora_root_access]; Faça um _logoff_ para que as configurações de grupo de usuários sejam ativadas;

5. Você pode [iniciar o agent](../getting-started/starting-agent.md) agora, porém, **tenha certeza de que o serviço do Docker está rodando**;


## Outras distribuições

Em breve...

!INCLUDE "../getting-started/banner.md"
!INCLUDE "../../links.md"
