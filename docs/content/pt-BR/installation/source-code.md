# Código fonte

## Requisitos

Dependendo do seu sistema operacional você precisa seguir alguns passos antes de instalar o `azk`. Siga-os aqui para o [Mac](mac_os_x.html), ou aqui para o [Linux](linux.html), mas sinta-se livre para ignorar a última etapa de instalação que usa um dos gerenciadores de pacotes (brew ou apt-get).

## Linux - Requisito Adicional

Se você estiver em um Linux, além de instalar o Docker será necessário instalar o `libnss-resolver`.

Siga as instruções [aqui](https://github.com/azukiapp/libnss-resolver#installing) para instalação através do [pacote](https://github.com/azukiapp/libnss-resolver/releases), ou do [source](https://github.com/azukiapp/libnss-resolver#from-the-source-without-azk).

## Baixando o código fonte do azk

Abra o terminal e execute os comandos:

```bash
$ git clone https://github.com/azukiapp/azk.git
$ cd azk
$ make
```

Quando o comando `make` acabar de construir o binário do `azk`, adicione o seguinte a arquivo de configuração do seu shell (~/.bashrc, ~/.zshrc):

```bash
# azk source and azk brew
if [ -d "$HOME/your/path/to/azk/bin" ]; then
  alias azksrc="$HOME/your/path/to/azk/bin/azk"
fi
```

Certifique-se de trocar `"$HOME/your/path/to/azk/bin"` para o diretório que você clonou o `azk`. O trecho acima irá primeiro checar se você contem a pasta `azk/bin` dentro do diretório apontado, e em seguida criar um alias chamado `azksrc` que pode ser utilizado de qualquer lugar do seu terminal.
