# Imagens

Para automatizar a preparação do ambiente de desenvolvimento, o `azk` utiliza imagens pré-configuradas com direferentes linguagens e bancos de dados. Estas imagens seguem o padrão do Docker e podem ser encontradas em http://images.azk.io.


### O que são imagens?

As imagens são a base dos sistemas definidos no [Azkfile.js](../azkfilejs/README.md). A propriedade [image](../azkfilejs/image.md) é o ponto de partida para a montagem dos sistemas. Elas podem estar no Docker Registry (http://images.azk.io) ou a partir de um `Dockerfile` local.


### Docker Registry

Tomemos como exemplo a imagem de node.js sugerida pelo `azk` a `azukiapp/node`. Ela está cadastrada no registro da Docker em https://registry.hub.docker.com/u/azukiapp/node/. Vamos verificar a instrução `FROM` do Dockerfile do [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile):

```
...
FROM azukiapp/web-based
MAINTAINER Azuki <support@azukiapp.com>
...
```

Observe que esta imagem (`azukiapp/ubuntu`) é baseada na imagem `azukiapp/web-based` que, por sua vez, é baseada em outra imagem, a `azukiapp/ubuntu`.

Veja a cadeia de herança:

- [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile)
- [azukiapp/web-based](https://github.com/azukiapp/docker-web-based/blob/master/Dockerfile)
- [azukiapp/ubuntu](https://github.com/azukiapp/docker-ubuntu/blob/master/Dockerfile)
- [library/ubuntu](https://github.com/tianon/docker-brew-ubuntu-core/blob/a9da4b3cd8977c2aacafe5d9d0056cbb360f2d1c/trusty/Dockerfile)
- [library/scratch](https://registry.hub.docker.com/u/library/scratch/)


### Dockerfile

Além de apontar para [imagens](../azkfilejs/image.html) dos registros da Docker, podemos ainda personalizar uma [imagem prória](../azkfilejs/image.html), utilizando um Dockerfile local. Dessa forma o `azk` podemos criar imagens totalmente personalizadas, com a instalação de novos componentes no sistema operacional, configuração do ambiente do container e testá-los localmente.

Recomendamos que após as devidas configurações, para que facilite o trabalho em equipe, a imagem seja enviada para o Docker Registry. Dessa forma outros desenvolvedores do seu projeto terão acesso fácil ao mesmo ambiente que você.

Utilize sempre um Dockerfile para se criar imagens pois isso aumenta a confiabilidade da imagem.

> Atenção: nunca suba dados confidenciais em suas imagens para um Docker Registry público;

