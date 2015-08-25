# Troubleshooting

> Caso não este conteúdo não seja suficiente para você solucionar seu problema, você sempre pode contar com nossa ajuda pelo Gitter: https://gitter.im/azukiapp/azk/pt.

1. [Não consigo acessar nenhuma URL *.azk.dev.io](README.html#no-consigo-acessar-nenhuma-url-devazkio)

1. [Estou enfrentando erros ao tentar executar o `azk start`](README.html#estou-enfrentando-erros-ao-tentar-executar-o-azk-start)

1. [Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?](README.html#estou-enfrentando-lentido-ao-executar-uma-aplicao-com-o-azk-no-meu-mac-o-que-pode-estar-acontecendo)

1. [Não há Internet disponível / Eu não estou conectado a nenhuma rede. O `azk` é iniciado, mas o navegador mostra que eu estou offline. Como faço para corrigir isso?](README.html#no-h-internet-disponvel--eu-no-estou-conectado-a-nenhuma-rede-o-azk--iniciado-mas-o-navegador-mostra-que-eu-estou-offline-como-fao-para-corrigir-isso)

1. [Como posso limpar os dados do Docker?](README.html#como-posso-limpar-os-dados-do-docker)

1. [Como posso limpar os dados persistidos em um projeto específico?](README.html#como-posso-limpar-os-dados-persistidos-de-um-projeto-especfico)

1. [Como posso limpar os dados persistidos de todos os projetos?](README.html#como-posso-limpar-os-dados-persistidos-de-todos-os-projetos)

1. [Estou recebendo o erro '[sync] fail Error: watch ENOSPC' ao tentar iniciar meu sistema. Como corrigir isso?](README.html#estou-recebendo-o-erro-sync-fail-error-watch-enospc-ao-tentar-iniciar-meu-sistema-como-corrigir-isso)

-------------------------

### Não consigo acessar nenhuma URL *.dev.azk.io

No processo de instalação, o `azk` cria um arquivo dentro da pasta `/etc/resolver` chamado `dev.azk.io`. Esse arquivo é responsável por resolver todas as chamadas a URLs no formato `*.dev.azk.io`. Caso isso não esteja funcionando, siga os seguintes passos:

1. Verifique que o resolver está configurado com `scutil --dns`:

   ```sh
   $ scutil --dns
   ...
   resolver #3
      domain : dev.azk.io
      nameserver[0] : 192.168.50.4
   ```
2. Caso ele não esteja listado, cheque que o azk criou o arquivo `dev.azk.io`:

   ```sh
   $ cd /etc/resolver
   $ cat dev.azk.io
   # azk agent configure
   nameserver 192.168.50.4.53
   ```

3. Caso ele se encontre na pasta, reinicie seu computador. Isso realmente ajuda!

4. Se isso não funcionar, tente desligar e ligar o AirPort no seu computador (Mac OS X).

5. Verifique que o "port forwarding" está habilitado em seu firewall (Mac OS X Mavericks):

   ```sh
   $ sysctl -w net.inet.ip.fw.enable=1
   ```

6. Yosemite: Caso isso ainda não funcione, habilite "port forwarding" manualmente:

   ```sh
   $ sudo pfctl -f /etc/pf.conf; sudo pfctl -e
   ```

Agradecimentos ao [pow](https://github.com/basecamp/pow/wiki/Troubleshooting#dns) pelas dicas de troubleshooting. :)


----------------------------------

### Estou enfrentando erros ao tentar executar o `azk start`

Às vezes pode acontecer de um banco de dados ficar corrompido.
Às vezes podem ser os arquivos da aplicação.
As medidas clássicas para se tentar contornar este tipo de problema
vão desde um simples `restart` até uma limpeza total das imagens do Docker.

A seguir seguem alguns passos para tentar fazer que seu `Azkfile.js`
 volte a funcionar.

#### Reinicie o agent do azk

Ao reiniciar o `azk agent` você irá levantar o DNS e o balanceador de carga novamente.

```sh
$ azk agent stop
$ azk agent start
```

#### Reinicie o(s) sistema(s)

Pare e inicie novamente cada sistema:

```sh
$ azk restart <system_name>
# ou
$ azk stop  <system_name>
$ azk start <system_name>
```

#### Reprovisione o(s) sistema(s)

Pare e inicie novamente cada sistema com a flag de reprovisionamento (`-R`):

```sh
$ azk restart -R <system_name>
# ou
$ azk stop <system_name>
$ azk start -R <system_name>
```

#### Verifique se seu comando de start está correto

Verifique se seu sistema está devidamente configurado. Isso significa que item `command` definido pelo sistema principal dentro do Azkfile.js deve ser corretamente executado.

##### Execute o `command` direto no shell

Entre no shell do sistema e execute o comando definido em `command` do seu Azkfile.js.

```sh
$ azk shell <system_name>

# por exemplo num container de Node.js você pode executar:
$ npm start
```

##### Verifique se seu servidor está associado à interface de rede `0.0.0.0`

Caso o comando executado no passo anterior seja concluído com sucesso e seu sistema envolva um servidor (é um sistema web, por exemplo), tenha certeza de que ele está associado à interface de rede correta (`0.0.0.0`, e não `localhost` ou `127.0.0.1`, que é o padrão de muitos sistemas). Para definir isso, verifique as opções de execução do servidor e busque por `bind` ou `host`, passando o valor `0.0.0.0`.

#### Verifique os logs

Verifique os logs para maiores informações sobre erros:

```sh
$ azk logs <system_name>
```

#### Azkfile.js: Troque o `sync` por `path`

Edite o seu `Azkfile.js` e troque os mounts que forem `sync` por `path`. A opção `path` é mais lenta, mas é mais estável.

```js
// de
mounts: {
  '/azk/#{manifest.dir}': sync("."),
},

// para
mounts: {
  '/azk/#{manifest.dir}': path("."),
},
```

#### Azkfile.js: Limpe as pastas de persistent e sync

Você pode checar [esta seção](README.html#como-posso-limpar-os-dados-persistidos-de-um-projeto-especfico) sobre como limpar dos dados persistidos e ter o seu sistema de volta ao estado inicial.

#### Dockerfile

Verifique como foi montado o `Dockerfile` que está usando. Pode existir, por exemplo, uma variável de ambiente que não foi devidamente configurada.

#### Azkfile.js

Verifique as versão anteriores do seu `Azkfile.js`. Mudou algo? Antes funcionava?
Veja os exemplos pelo site http://images.azk.io/. Leia atentamente a documentação do azk: [Azkfile.js](../azkfilejs/README.html).

-------------------------

### Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?

Esse é um problema conhecido, causado quando usa-se a opção de montagem `path` com a pasta do seu projeto. Para resolver isso, simplesmente altere a opção de `path` para `sync` em seu Azkfile.js.

Nós recomendamos fortemente e leitura da [seção sobre `mounts`](/pt-BR/reference/azkfilejs/mounts.html) na documentação do Azkfile.js.

-------------------------

#### Não há Internet disponível / Eu não estou conectado a nenhuma rede. O `azk` é iniciado, mas o navegador mostra que eu estou offline. Como faço para corrigir isso?

Este problema ocorre apenas no Sistema Operacional Mac OS X. Em SOs baseados em Linux, o `azk` deve funcionar independente da disponibilidade de Internet.

Uma vez que não há Internet disponível, a resolução de DNS falha, incluindo domínios `azk`. Para superar isso, você pode definir domínios `azk` em seu arquivo `/etc/hosts`.

Assumindo que o seu domínio de aplicativo é `demoazk.dev.azk.io` e seu IP `azk` é `192.168.51.4` (execute `azk doctor` para obter essa informação), execute o seguinte comando para adicionar a configuração adequada na parte inferior de seu arquivo `/etc/hosts`:

```bash
$ echo "192.168.51.4 demoazk.dev.azk.io #azk" | sudo tee -a /etc/hosts
```

Você deve adicionar uma entrada para cada aplicativo que você está executando com o `azk`: `demoazk.dev.azk.io`, `blog.dev.azk.io`, `myapp.dev.azk.io` e `*.dev.azk.io`

Não se esqueça de remover essas linhas depois que você estiver com acesso a Internet estabilizado. Se você usou o comando anterior, basta executar:

```bash
$ sed '/^.*#azk$/ { N; d; }' /etc/hosts
```

-------------------------

### Como posso limpar os dados do Docker?

#### Matando os containers em execução

Para matar todos os containers em execução (será necessário reiniciar o `azk agent`):

```bash
$ adocker kill $(adocker ps -q | tr '\r\n' ' ')
```

#### Removendo os containers parados

Para remover os containers parados:

```bash
$ adocker rm -f $(adocker ps -f status=exited -q | tr '\r\n' ' ')
```

#### Removendo as imagens do Docker

Para remover imagens do Docker usando filtros (neste caso o filtro é 'azkbuild'):

```bash
$ adocker rmi $(adocker images | grep "azkbuild" | awk '{print $3}' | tr '\r\n' ' ')
```

#### Removendo as imagens do Docker sem tag

Para remover todas imagens sem tag:

```bash
$ adocker rmi $(adocker images -q -f dangling=true | tr '\r\n' ' ')
```

#### Removendo todas as imagens do Docker (tenha cuidado!)

O comando abaixo remove todas as imagens baixadas do Docker Hub.
O problema é que, na próxima execução, você terá que baixar novamente
todas imagens que for usar.

```bash
$ adocker rmi $(adocker images -q | tr '\r\n' ' ')
```

#### Outras dicas sobre Docker

O link a seguir possui várias dicas para o dia a dia com Docker. Só não se esqueça de executar os comandos como `adocker`, principalmente se estiver usando uma Máquina Virtual.

- https://github.com/wsargent/docker-cheat-sheet#tips

----------------

### Como posso limpar os dados persistidos de um projeto específico?

**CUIDADO:** Isso irá limpar as `persistent_folders` e as `sync_folders` do projeto. Isso significa que todos os dados persistidos desse projeto (incluindo os banco de dados) serão perdidos para sempre. **Continue com extremo cuidado.**

1) Verifique as `persistent_folders` e as `sync_folders` do sistema:

```sh
$ azk info | grep -P "(persistent|sync)_folders"
```

2) Remova as `persistent_folders` e as `sync_folders` do sistema:

#### Mac OS X

```sh
$ azk vm ssh -- sudo rm -rf ".../persistent_folders/0x0x0x0x0x0x"
$ azk vm ssh -- sudo rm -rf ".../sync_folders/0x0x0x0x0x0x"
# ...
```

#### Linux

```sh
$ sudo rm -rf ".../persistent_folders/0x0x0x0x0x0x"
$ sudo rm -rf ".../sync_folders/0x0x0x0x0x0x"
# ...
```

3) Reinicie os sistemas com a flag de reprovisionamento (`-R`):

```sh
$ azk stop
$ azk start -R
```

----------------------

### Como posso limpar os dados persistidos de todos os projetos?

**CUIDADO:** Isso irá limpar todas as `persistent_folders` e `sync_folders`. Isso significa que todos os dados persistidos (incluindo os banco de dados) de **todos os projetos** serão perdidos para sempre. **Continue com extremo cuidado.**


#### Mac OS X

Você pode apagar todas as `persistent_folders` e `sync_folders` de dentro da Máquina Virtual.
Verifique o tamanho ocupado em disco, dentro da VM:

```sh
azk vm ssh -- du -sh /mnt/sda1/azk/sync_folders
azk vm ssh -- du -sh /mnt/sda1/azk/persistent_folders
```

Para remover **todas** as `persistent_folders` e `sync_folders`:

```sh
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/persistent_folders
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/sync_folders
```

#### Linux

Você pode apagar as `persistent_folders` e `sync_folders`.
Verifique o tamanho ocupado em disco:

```sh
sudo du -hs ~/.azk/data/persistent_folders
sudo du -hs ~/.azk/data/sync_folders
```

Para remover **todas** as `persistent_folders` e `sync_folders:

```sh
sudo rm -rf ~/.azk/data/persistent_folders
sudo rm -rf ~/.azk/data/sync_folders
```

----------------------

### Estou recebendo o erro `[sync] fail Error: watch ENOSPC` ao tentar iniciar meu sistema. Como corrigir isso?

Provavelmente você tem um sistema que usa a opção de mount `sync` em seu Azkfile.js. Esse problema é relacionado com a limitação do SO em quantos arquivos um usuário pode monitorar ao mesmo tempo. A solução é simplesmente aumentar esse limite:

### Linux

#### Ubuntu or Fedora

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

#### Arch Linux

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.d/99-sysctl.conf && sudo sysctl --system
```
