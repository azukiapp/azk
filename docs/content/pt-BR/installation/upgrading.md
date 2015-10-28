# Atualizando o azk

1. [Atualizando a partir do azk >= 0.6.0](upgrading.html#atualizando-a-partir-do-azk--060)
1. [Atualizando a partir do azk <= 0.5.1](upgrading.html#atualizando-a-partir-do-azk--051)

## Atualizando a partir do azk >= 0.6.0

Uma vez que o `azk` tenha sido instalado por pacotes o processo de atualização se torna realmente simples:

### Mac OS X

```bash
$ azk agent stop
$ brew update
$ brew upgrade azukiapp/azk/azk
```

### Linux

Ubuntu:

```bash
$ azk agent stop
$ sudo apt-get update
$ sudo apt-get upgrade azk
```

Fedora:

```bash
$ azk agent stop
$ sudo yum upgrade azk
```

## Atualizando a partir do azk <= 0.5.1

Para usuários que testaram e utilizaram o `azk` em versões anteriores a `0.6.0` o processo de atualização não é simples devido a incompatibilidade do modelo de instalação anterior com a instalação por pacotes.

Antes de seguir para uma nova instalação do `azk` é preciso seguir alguns passos de remoção da versões anteriores:

1. **Aviso:** o `azk 0.6.0` não tem compatibilidade retroativa. Arquivos persistentes, como informações de banco de dados e instalação de dependências serão removidas, por isso efetue o procedimento abaixo para obter um backup:

  ```bash
  $ azk agent stop
  $ cp -Rf ~/.azk/data [path_to_backup]
  ```

2. Para os projetos em que você já estava utilizando o `azk`, é preciso fazer um ajuste no `Azkfile.js`. Basicamente substitua `mounts_folders` e `persistent_folders` pela nova opção `mounts`, conforme o exemplo:

  Onde você utilizava:

    ```javascript
    systems({
      example: {
        // ...
        mounts_folders: { ".": "/azk/#{system.name}" },
        persistent_folders: [ "/data" ],
      }
    });
    ```

  Deve substituir por (observe a inversão das chaves na opção `mounts_folders`):

    ```javascript
    systems({
      example: {
        // ...
        mounts: {
          "/azk/#{system.name}": path("."),
          "/data": persistent("data"),
        },
      }
    });
    ```

3. Quando for executar o comando `start` nos projetos que você já utilizava `azk`, faça com a opção extra `--reprovision`, conforme o exemplo:

  ```bash
  $ azk start --reprovision
  ```

4. Agora podemos remover a instalação anterior do `azk` com os seguintes comandos:

  ```bash
  $ azk agent stop
  $ azk vm remove # mac only
  $ rm -Rf ~/.azk
  $ sudo rm /etc/resolver/azk.dev
  # and remove `~/.azk/bin` from your `$PATH`
  ```

5. Pronto, você está apto a instalar a nova versão do `azk`:

  * [Linux](linux.md#requisitos)
  * [Mac OS X](mac_os_x.md#requisitos)

!INCLUDE "../../links.md"
