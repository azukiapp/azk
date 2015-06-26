# Troubleshooting

1. [Não consigo acessar nenhuma URL *.azk.dev.io](README.html#no-consigo-acessar-nenhuma-url-devazkio)

1. [Estou enfrentando erros ao tentar executar o `azk start`](README.html#estou-enfrentando-erros-ao-tentar-executar-o-azk-start)

1. [Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?](README.html#estou-enfrentando-lentido-ao-executar-uma-aplicao-com-o-azk-no-meu-mac-o-que-pode-estar-acontecendo)

1. [Não há Internet disponível / Eu não estou conectado a nenhuma rede. O `azk` é iniciado, mas o navegador mostra que eu estou offline. Como faço para corrigir isso?](README.html#no-h-internet-disponvel--eu-no-estou-conectado-a-nenhuma-rede-o-azk--iniciado-mas-o-navegador-mostra-que-eu-estou-offline-como-fao-para-corrigir-isso)


1. [Como posso limpar os dados do Docker?](README.html#como-posso-limpar-os-dados-do-docker)

1. [Como posso limpar os dados persistidos do azk](README.html#como-posso-limpar-os-dados-persistidos-do-azk)

-------------------------

### Não consigo acessar nenhuma URL *.dev.azk.io

No processo de instalação, o `azk` cria um arquivo dentro da pasta `/etc/resolver` chamado `dev.azk.io`. Esse arquivo é responsável por resolver todas as chamadas a URLs no formato `*.dev.azk.io`. Caso isso não esteja funcionando, siga os seguintes passos:

1. Verifique que o resolver está configurado com scutil --dns:

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

4. Se isso não funcionar, tente desligar e ligar o AirPort no seu computador.

5. Verifique que "port forwarding" está habilitado em seu firewall (OS X Mavericks):

   ```sh
   $ sysctl -w net.inet.ip.fw.enable=1
   ```

6. Yosemite: Caso isso ainda não funcione, habilite "port forwarding" manualmente:

   ```sh
   sudo pfctl -f /etc/pf.conf; sudo pfctl -e
   ```

Agradecimentos ao [pow](https://github.com/basecamp/pow/wiki/Troubleshooting#dns) pelas dicas de troubleshooting. :)


----------------------------------

### Estou enfrentando erros ao tentar executar o `azk start`.

Às vezes pode acontecer de um banco de dados ficar corrompido.
Às vezes podem ser os arquivos da aplicação.
As medidas clássicas para se tentar contornar este tipo de problema
vão desde um simples `restart` até uma limpeza total das imagens.

A seguir seguem alguns passos para tentar fazer que seu `Azkfile.js`
 volte a funcionar.

#### restart agent

Ao reiniciar o `azk agent` você irá levantar o dns e o balancer novamente.

```sh
azk agent stop
azk agent start
```

#### restart system(s)

Pare e inicie o sistema novamente:

```sh
azk restart <system_name>
# ou
azk stop  <system_name>
azk start <system_name>
```

#### reprovision system(s)

Pare e inicie o sistema novamente com 'reprovision'.

```sh
azk restart -R <system_name>
# ou
azk stop <system_name>
azk start -R <system_name>
```

#### vizualizar logs

Verifique o log para maiores informações sobre erros.

```sh
azk logs <system_name>
```

#### executar `command` direto no shell

Entre no shell do sistema e simule o comando `command: ` do seu `Azkfile.js`.

```sh
azk shell <system_name>

# por exemplo num container de node.js você pode executar:
$> npm start
```


#### sync -> path

Edite o seu `Azkfile.js` e troque os mounts que forem `sync` pelo mais antigo e estável `path`

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

#### limpar persistent folders de um sistema

1) Verifique seus 'persistent folders'

```sh
azk info
```

2) Remova as pastas ..../persistent_folders/0x0x0x0x0x0x dos sistemas que estão dando problema

```sh
sudo rm -rf ".../persistent_folders/0x0x0x0x0x0x"
sudo rm -rf ".../persistent_folders/1x1x1x1x1x1x"
...
```

3) Reexecute os sistemas com reprovision

```sh
azk stop
azk start -R
```

#### VM (Mac ou Linux + VM) - limpar todos `persistent_folders` e `sync_folders` (cuidado!)

Verifique o tamnho ocupado em disco, dentro da VM:

```sh
azk vm ssh -- du -sh /mnt/sda1/azk/sync_folders
azk vm ssh -- du -sh /mnt/sda1/azk/persistent_folders
```

Isto vai limpar completamente as `persistent_folders` e `sync_folders` dentro da VM.
Atente para o fato que perderá todos os dados persistidos pelos bancos de dados de todos os sistemas já levantados.

```sh
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/sync_folders
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/persistent_folders
```

#### Linux - limpar todos `persistent_folders` e `sync_folders` (cuidado!)

Verifique o tamnho ocupado em disco:

```sh
sudo du -sh ~/.azk/data/sync_folders
sudo du -sh ~/.azk/data/persistent_folders
```

Isto vai limpar completamente as `persistent_folders` e `sync_folders`.
Atente para o fato que perderá todos os dados persistidos pelos bancos de dados de todos os sistemas já levantados.

```sh
sudo rm -rf ~/.azk/data/sync_folders
sudo rm -rf ~/.azk/data/persistent_folders
```

#### Dockerfile

Verifique como foi montado o Dockerfile que esta usando. Pode existir, por exemplo, uma varíavel de ambiente que não foi devidamente configurada.

#### Azkfile.js

Verifique as versão anteriores do seu `Azkfile.js`. Mudou algo? Antes funcionava?
Veja os exemplos pelo site http://images.azk.io/. Leia atentamente a documentação do azk: [Azkfile.js](../azkfilejs/README.html).


Caso não esteja conseguindo levantar o seu `Azkfile.js` você sempre pode contar com nossa ajuda pelo https://gitter.im/azukiapp/azk/pt.

-------------------------

### Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?

Esse é um problema conhecido, causado quando usa-se a opção de montagem `path` com a pasta do seu projeto. Para resolver isso, simplesmente altere a opção de `path` para `sync` em seu Azkfile.js.

Nós recomendamos fortemente e leitura da [seção sobre `mounts`](/pt-BR/reference/azkfilejs/mounts.html) na documentação do Azkfile.js.

-------------------------

#### Não há Internet disponível / Eu não estou conectado a nenhuma rede. O `azk` é iniciado, mas o navegador mostra que eu estou offline. Como faço para corrigir isso?

Este problema ocorre apenas no Sistema Operacional Mac OS X. Em SOs baseados em Linux, o `azk` deve funcionar tanto com Internet disponível como indisponível.

Uma vez que não há Internet disponível, a resolução de DNS falha, incluindo domínios `azk`. Para superar isso, você pode definir domínios `azk` em seu arquivo `/etc/hosts`.

Assumindo que o seu domínio de aplicativo é `demoazk.dev.azk.io` e seu IP `azk` é `192.168.51.4` (execute `azk doctor` para obter essa informação), execute o seguinte comando para adicionar a configuração adequada na parte inferior de seu arquivo `/etc/hosts`:

```bash
$ echo "192.168.51.4 demoazk.dev.azk.io #azk" | sudo tee -a /etc/hosts
```

Você deve adicionar uma entrada para cada aplicativo que você está executando com o `azk`: `azkdemo.dev.azk.io`, `blog.dev.azk.io`, `myapp.dev.azk.io` e `*.dev.azk.io`

Não se esqueça de remover estas linhas depois que você estiver com acesso a Internet estabilizado. Se você usou o comando anterior, basta executar:

```bash
$ sed '/^.*#azk$/ { N; d; }' /etc/hosts
```

-------------------------

### Como posso limpar os dados do Docker?

#### Containers parados

Para apagar os containers parados, antigos:

```bash
adocker rm -f $(adocker ps -f status=exited -q | tr '\r\n' ' ')
```

#### Imagens do Docker

Remover imagens usando filtros. Neste caso o filtro é 'azkbuild':

```bash
adocker rmi $(adocker images | grep "azkbuild" | awk '{print $3}' | tr '\r\n' ' ')
```

#### Imagens do Docker sem tag

Remover todas imagens sem tag:

```bash
adocker rmi $(adocker images -q -f dangling=true | tr '\r\n' ' ')
```

#### Imagens do Docker - Limpeza geral (cuidado!)

O comando abaixo apaga todas as imagens baixadas do Docker Hub.
O problema é que na próxima execução você terá que baixar
todas imagens que for usar novamente.

```bash
adocker rmi $(adocker images -q | tr '\r\n' ' ')
```

#### Containers em execução

Para matar todos os containers em execução (será necessário reiniciar o agent):

```bash
adocker kill $(adocker ps -q | tr '\r\n' ' '); \
```

#### Outras dicas sobre Docker

O link a seguir possui várias dicas para o dia a dia com Docker. Só não se esqueça de executar os comandos como `adocker`, principalmente se estiver usando máquina virtual.

- https://github.com/wsargent/docker-cheat-sheet#tips


----------------

### Como posso limpar os dados persistidos do azk?

#### VM (Mac ou Linux + VM): `persistent_folders` e `sync_folders` (cuidado!)

Você ainda pode apagar seus persistent_folder e sync_folder.
Verifique o tamnho ocupado em disco, dentro da VM:

```sh
azk vm ssh -- du -sh /mnt/sda1/azk/sync_folders
azk vm ssh -- du -sh /mnt/sda1/azk/persistent_folders
```

Isto vai limpar completamente as `persistent_folders` e `sync_folders`.
Atente para o fato que **perderá todos os dados persistidos pelos bancos de dados** de todos os sistemas já levantados. Será ainda necessário que todos os sistemas sejam executados com a opção `--reprovision`. Só use esta opção em último caso.

```sh
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/sync_folders
azk vm ssh -- sudo rm -rf /mnt/sda1/azk/persistent_folders
```

#### Linux: `persistent_folders` e `sync_folders` (cuidado!)

Você ainda pode apagar seus `persistent_folder` e `sync_folder`.
Primeiro vamos verificar o quanto estes diretórios estão ocupando em disco.

```sh
sudo du -hs ~/.azk/data/persistent_folders
sudo du -hs ~/.azk/data/sync_folders
```

Isto vai limpar completamente as `persistent_folders` e `sync_folders`.
Atente para o fato que **perderá todos os dados persistidos pelos bancos de dados** de todos os sistemas já levantados. Será ainda necessário que todos os sistemas sejam executados com a opção `--reprovision`. Só use esta opção em último caso.

```sh
sudo rm -rf ~/.azk/data/sync_folders
sudo rm -rf ~/.azk/data/persistent_folders
```
