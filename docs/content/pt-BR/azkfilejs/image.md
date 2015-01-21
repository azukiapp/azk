## image

Define qual "imagem" será utilizada para levantar a instância do container. Atualmente os _providers_ disponíveis são `docker` e `dockerfile`. No primeiro caso a imagem é baixada do [Docker](https://registry.hub.docker.com) e no segundo caso, `dockerfile`, é realizado o _build_ localmente.

#### Uso:

```js
image: { docker: '[NAMESPACE/REPOSITORY:TAG]' },
image: { dockerfile: './CAMINHO_DO_DOCKERFILE' },
```

#### Docker:

A imagem é baixada do [Docker](https://registry.hub.docker.com)

```js
// modo reduzido
image: { docker: '[NAMESPACE/REPOSITORY:TAG]' },

// explícito
image: {
    provider: 'docker',
    repository: 'NAMESPACE/REPOSITORY',
    tag: 'TAG'
},
```

#### Dockerfile:

É realizado o _build_ localmente. Observe que é possivel especificar a **pasta** que contém o arquivo `Dockerfile` ou o próprio **`Dockerfile`**, que neste caso, não precisa possuir o nome _Dockerfile_.

```js
// modo reduzido
image: { dockerfile: 'PASTA_COM_DOCKERFILE' },
image: { dockerfile: 'CAMINHO_DO_DOCKERFILE' },

// explícito
image: {
    provider: 'dockerfile',
    path: 'PASTA_COM_DOCKERFILE'
},
image: {
    provider: 'dockerfile',
    path: 'CAMINHO_DO_DOCKERFILE'
},
```

##### Exemplos:

```js
// Podemos definir tags diferentes e assim pegar versões diferentes do repositório [Azktcl](https://registry.hub.docker.com/u/azukiapp/azktcl/)
image: { docker: "azukiapp/azktcl:0.0.1" },
image: { docker: "azukiapp/azktcl:0.0.2" },

// Todas as configurações abaixo apontam para a mesma imagem,
// ou seja, várias tags podem apontar para a mesma imagem.
// Observe que, para as imagens oficiais do docker, não é
// necessário nem informar o namespace (library, no caso).
image: { docker: "node:0" },
image: { docker: "node:0.10" },
image: { docker: "node:latest" },
image: { docker: "library/node:latest" },  // <- library/ é opcional somente neste caso, para os repositórios padrões do Docker
```

