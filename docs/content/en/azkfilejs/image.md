## image

Defines which "image" will be used to start the instance of the container. Currently available _providers_ are `docker` and `dockerfile`. In the first case the image is downloaded from [Docker](https://registry.hub.docker.com), and in the second case, `dockerfile` the _build_ is performed locally.

#### Usage:

```js
image: { docker: '[NAMESPACE/REPOSITORY:TAG]' },
image: { dockerfile: './PATH_TO_DOCKERFILE' },
```

#### Docker:

The image is downloaded from [Docker](https://registry.hub.docker.com)

```js
// short mode
image: { docker: '[NAMESPACE/REPOSITORY:TAG]' },

// explicit
image: {
    provider: 'docker',
    repository: 'NAMESPACE/REPOSITORY',
    tag: 'TAG'
},
```

#### Dockerfile:

The _build_ is performed locally. Note that it's possible to specify the **folder** that contains the `Dockerfile` file or the **`Dockerfile`** file itself, which in this case, does not need to have the name _Dockerfile_.

```js
// short mode
image: { dockerfile: 'FOLDER_WITH_DOCKERFILE' },
image: { dockerfile: 'PATH_TO_DOCKERFILE' },

// explicit
image: {
    provider: 'dockerfile',
    path: 'FOLDER_WITH_DOCKERFILE'
},
image: {
    provider: 'dockerfile',
    path: 'PATH_TO_DOCKERFILE'
},
```

##### Examples:

```js
// We can define different tags which allows us to pick different versions of the repository [Azktcl](https://registry.hub.docker.com/u/azukiapp/azktcl/)
image: { docker: "azukiapp/azktcl:0.0.1" },
image: { docker: "azukiapp/azktcl:0.0.2" },

// All settings below point to the same image,
// that is, multiple tags can point to the same image.
// Note that for the official docker images, it is not
// necessary to inform the namespace (library, in this case).
image: { docker: "node:0" },
image: { docker: "node:0.10" },
image: { docker: "node:latest" },
image: { docker: "library/node:latest" },  // <- library/ is optional only in this case, for the standard Docker repositories
```