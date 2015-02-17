## azk vm

Controla a máquina virtual utilizada no Mac OS X.

#### Uso:

    $ azk [options] vm [options] {action}

_______________
### azk vm installed

Verifica se a máquina virtual está instalada.

#### Exemplo:

    $ azk vm installed
    azk: virtual machine is not installed, try `azk vm install`.

_______________
### azk vm start

Inicia a máquina virtual.

#### Exemplo:

    $ azk vm start

_______________
### azk vm stop

Para a máquina virtual.

#### Exemplo:

    $ azk vm stop

_______________
### azk vm status

Exibe a situção atual da máquina virtual.

#### Exemplo:

	$ azk vm status

_______________	
### azk vm ssh

Acessa a máquina virtual via protocolo SSH.

#### Exemplo:

    $ azk vm ssh
    
_______________	
### azk vm remove

Remove a máquina virtual.

#### Opções:

- `--force`      Tenta forçar a remoção da máquina virtual. É útil quando o comando `azk vm remove` não funciona devido a algum problema desconhecido.

#### Exemplos:

##### Tenta remover a máquina virtual normalmente:

    $ azk vm remove

##### Força a remoção da máquina virtual:
    
    $ azk vm remove --force