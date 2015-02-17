# Instalação

A instalação do `azk` é realmente muito simples e esta disponível através de pacotes no [Linux](linux.md) e no [Mac OS X](mac_os_x.md).

A instalação vai adicionar o comando `azk` ao path do sistema. Isso torna o comando `azk` disponível no terminal.

## Instalação expressa do azk

#### via curl

```sh
curl -Ls http://azk.io/install.sh | sudo bash
```

#### via wget

```sh
wget http://azk.io/install.sh -v -O install.sh && sudo bash ./install.sh; rm -rf ./install.sh
```

## Requisitos mínimos de instalação

* Uma máquina com arquitetura 64 bits
* Mac OS X ou Linux (Windows: planned)
* bash (ferramenta de linha de comando disponível em praticamente todos os sistemas unix)
* Conexão com a internet (apenas durante o processo de download das [imagens](../imagens/README.md))

!INCLUDE "../getting-started/banner.md"
