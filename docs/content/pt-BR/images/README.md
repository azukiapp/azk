# Imagens

Para automatizar a preparação do ambiente de desenvolvimento, o `azk` utiliza imagens pré-configuradas com diferentes linguagens e bancos de dados. Estas imagens seguem o padrão do Docker e podem ser encontradas em [http://images.azk.io](http://images.azk.io).


### O que são imagens?

As imagens são a base dos sistemas definidos no [Azkfile.js](../azkfilejs/README.md). A propriedade [image](../reference/azkfilejs/image.md) é o ponto de partida para a montagem dos sistemas. As imagens podem ser do tipo [docker](../reference/azkfilejs/image.html#docker) ou [dockerfile](../reference/azkfilejs/image.html#dockerfile). Quando a imagem do sistema estiver configurada como [docker](../reference/azkfilejs/image.html#docker) ela será baixada diretamente do **[Registro do Docker](https://registry.hub.docker.com/)**. Quando configurada como [dockerfile](../reference/azkfilejs/image.html#dockerfile) será buscado um arquivo local.


### Registro do Docker

O [Registro do Docker](https://registry.hub.docker.com/) é um repositório público de imagens para Docker. Tomemos como exemplo a imagem de node.js sugerida pelo `azk`: `azukiapp/node`. Ela aponta ao [repositório do Azuki no Registro do Docker](https://registry.hub.docker.com/u/azukiapp/node/).

Verificando a instrução `FROM` do `Dockerfile` do [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile) observamos que a imagem é baseada na imagem `azukiapp/web-based` que, por sua vez, é baseada em outra imagem, a `azukiapp/ubuntu`.

```
...
FROM azukiapp/web-based
MAINTAINER Azuki <support@azukiapp.com>
...
```

Cadeia de herança da [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile):

- [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile)
- [azukiapp/web-based](https://github.com/azukiapp/docker-web-based/blob/master/Dockerfile)
- [azukiapp/ubuntu](https://github.com/azukiapp/docker-ubuntu/blob/master/Dockerfile)
- [library/ubuntu](https://github.com/tianon/docker-brew-ubuntu-core/blob/a9da4b3cd8977c2aacafe5d9d0056cbb360f2d1c/trusty/Dockerfile)
- [library/scratch](https://registry.hub.docker.com/u/library/scratch/)

Dessa forma podemos aproveitar a configuração da imagem base (indicada na instrução `FROM`) para criar imagens padronizadas e úteis para a necessidade do `azk`.


### Dockerfile local

Além de apontar para [imagens](../azkfilejs/image.html) dos registros do Docker, podemos ainda personalizar uma imagem própria utilizando um [dockerfile local](../azkfilejs/image.html#dockerfile). Dessa forma podemos criar imagens totalmente personalizadas e testá-las localmente.

Recomendamos que após as devidas configurações, para que facilite o trabalho em equipe, a imagem seja enviada para o [Registro do Docker](https://registry.hub.docker.com/). Dessa forma outros desenvolvedores do seu projeto terão acesso fácil ao mesmo ambiente que você.

Utilize sempre um Dockerfile para criar imagens. Isso permite que outras pessoas com interesse em usar sua imagem vejam como ela foi construída.

> Atenção: nunca suba dados confidenciais em suas imagens para um [Registro do Docker](https://registry.hub.docker.com/) público;

