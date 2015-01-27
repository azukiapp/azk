# Linux

!INCLUDE "warning.md"

## Requisitos

* Distribuições (testadas): Ubuntu 12.04/14.04 e Fedora 20
* [Docker][docker] 1.3.0
* Não estar rodando nenhum serviço nas portas `80` e `53`

**Importante**: Se você estiver rodando algum serviço nas portas `80` e/ou `53` você deve customizar a configuração do `azk` definindo as seguintes variáveis `AZK_BALANCER_PORT` e `AZK_DNS_PORT` respectivamente, antes de executar o `azk agent start`. 

## Ubuntu Trusty 14.04 (LTS) (64-bit)

1. Instale o Docker:

  - [Instale **a versão 1.3 do Docker**][docker_ubuntu_14_04]
  - Configure para que seu usuário [tenha acesso ao Docker][docker_root_access];
  - [Desabilite o uso de dnsmasq][docker_ubuntu_dns];
  - **Tenha certeza de que o serviço do Docker está rodando**;

2. Adicionando as chaves do Azuki ao seu keychain local:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

3. Adicione o repositório do Azuki a lista de sources do apt:

  ```bash
  $ echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list
  ```

4. Atualize a lista de pacotes e instale o azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

## Ubuntu Precise 12.04 (LTS) (64-bit)

1. Instale o Docker:

  - [Instale **a versão 1.3 do Docker**][docker_ubuntu_12_04]
  - Configure para que seu usuário [tenha acesso ao Docker][docker_root_access];
  - **Tenha certeza de que o serviço do Docker está rodando**;
  
2. Adicionando as chaves do Azuki ao seu keychain local:

  ```bash
  $ sudo apt-key adv --keyserver keys.gnupg.net \
    --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9
  ```

3. Adicione o repositório do Azuki a lista de sources do apt:

  ```bash
  $ echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | \
    sudo tee /etc/apt/sources.list.d/azuki.list
  ```

4. Atualize a lista de pacotes e instale o azk:

  ```bash
  $ sudo apt-get update
  $ sudo apt-get install azk
  ```

## Fedora 20

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

4. Antes de executar o `azk agent`:

  - Configure para que seu usuário [tenha acesso ao Docker][docker_root_access];
  - **Tenha certeza de que o serviço do Docker está rodando**;

## Outras distribuições

Em breve...

!INCLUDE "../getting-started/banner.md"
!INCLUDE "../../links.md"

