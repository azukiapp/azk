# Troubleshooting

1. [Não consigo acessar nenhuma URL *.azk.dev.io](README.html#no-consigo-acessar-nenhuma-url-azkdevio)
1. [`azk agent start` não conecta com docker](README.html#azk-agent-start-no-conecta-com-docker)
1. [Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?](README.html#estou-enfrentando-lentido-ao-executar-uma-aplicao-com-o-azk-no-meu-mac-o-que-pode-estar-acontecendo)

##### Não consigo acessar nenhuma URL *.azk.dev.io

No processo de instalação, o azk cria um arquivo dentro da pasta `/etc/resolver` chamado `azk.dev.io`. Esse arquivo é responsável por resolver todas as chamadas a URLs no formato *.azk.dev.io. Caso isso não esteja funcionando, siga os seguintes passos:

1. Verifique que o resolver está configurado com scutil --dns:

   ```sh
   $ scutil --dns
   ...
   resolver #3
      domain : azk.dev.io
      nameserver[0] : 192.168.50.4
   ```

2. Caso ele não esteja listado, cheque que o azk criou o arquivo `azk.dev.io`:

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

##### `azk agent start` não conecta com docker

Caso você mexa na VM do azk através do VirtualBox, podem ocorrer alguns erros na execução do azk. Por exemplo, ele pode dar uma mensagem de erro em relação ao estado da VM como "Saved", "Running", ou simplesmente não conectar com docker. Para resolver isso:

- Remover a máquina virtual do azk com:

`azk vm remove`

- Listar quais o serviços dhcp estão criados:

`VBoxManage list dhcpservers`

- Remover eles com:

`VBoxManage dhcpserver remove --netname [NetworkName]`

- Listar quais as interfaces de redes estão configuradas:

`VBoxManage list hostonlyifs`

- Remover elas com:

`VBoxManage hostonlyif remove [Name]`

##### Estou enfrentando lentidão ao executar uma aplicação com o azk no meu Mac. O que pode estar acontecendo?

Esse é um problema conhecido e se dá pela forma como os arquivos são "compartilhados" entre a máquina virtual (Virtual Box) e o host (Mac). Fizemos grandes melhorias na versão 0.10 do azk, mas esse problema ainda pode ocorrer principalmente em aplicações grandes e com muitos arquivos, como aplicações rails, por exemplo.
