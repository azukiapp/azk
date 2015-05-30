# Troubleshooting

1. [Não consigo acessar nenhuma URL *.azk.dev.io](README.html#no-consigo-acessar-nenhuma-url-devazkio)
1. [Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?](README.html#estou-enfrentando-lentido-ao-executar-uma-aplicao-com-o-azk-no-meu-mac-o-que-pode-estar-acontecendo)
1. [Não há Internet disponível / Eu não estou conectado a nenhuma rede. O `azk` é iniciado, mas o navegador mostra que eu estou offline. Como faço para corrigir isso?](README.html#no-h-internet-disponvel--eu-no-estou-conectado-a-nenhuma-rede-o-azk--iniciado-mas-o-navegador-mostra-que-eu-estou-offline-como-fao-para-corrigir-isso)

#### Não consigo acessar nenhuma URL *.dev.azk.io

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

#### Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?

Esse é um problema conhecido, causado quando usa-se a opção de montagem `path` com a pasta do seu projeto. Para resolver isso, simplesmente altere a opção de `path` para `sync` em seu Azkfile.js.

Nós recomendamos fortemente e leitura da [seção sobre `mounts`](/pt-BR/reference/azkfilejs/mounts.html) na documentação do Azkfile.js.

#### Não há Internet disponível / Eu não estou conectado a nenhuma rede. O `azk` é iniciado, mas o navegador mostra que eu estou offline. Como faço para corrigir isso?

Este problema ocorre apenas no Sistema Operacional Mac OS X. Em SOs baseados em Linux, o `azk` deve funcionar tanto com Internet disponível como indisponível.

Uma vez que não há Internet disponível, a resolução de DNS falha, incluindo domínios `azk`. Para superar isso, você pode definir domínios `azk` em seu arquivo `/etc/hosts`.

Assumindo que o seu domínio de aplicativo é `demoazk.dev.azk.io` e seu IP `azk` é `192.168.51.4` (execute `azk doctor` para obter essa informação), execute o seguinte comando para adicionar a configuração adequada na parte inferior de seu arquivo `/etc/hosts`:

```bash
$ echo "192.168.51.4 demoazk.dev.azk.io #azk" | sudo tee -a /etc/hosts
```

Você deve adicionar uma entrada para cada aplicativo que você está executando com o `azk`: `azkdemo.dev.azio.io`, `blog.dev.azk.io`, `myapp.dev.azk.io` e `*.dev.azk.io`

Não se esqueça de remover estas linhas depois que você estiver com acesso a Internet estabilizado. Se você usou o comando anterior, basta executar:

```bash
$ sed '/^.*#azk$/ { N; d; }' /etc/hosts
```
