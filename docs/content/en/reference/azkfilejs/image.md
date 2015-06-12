## image

Defines which "image" will be used to start the instance of the container. Currently available _providers_ are `docker` and `dockerfile`. In the first case the image is downloaded from [Docker Registry](https://registry.hub.docker.com), and in the second case, `dockerfile` the _build_ is performed locally.

#### Usage:

```js
image: { docker: '[NAMESPACE/REPOSITORY:TAG]' },
image: { dockerfile: './PATH_TO_DOCKERFILE' },
```

#### Docker:

The image is downloaded from [Docker Registry](https://registry.hub.docker.com)

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

To learn how to build your _Dockerfile_, check out the [docs](http://docs.docker.com/reference/builder/#format). Note that here we have the same behaviour of the command `docker build`, even sending all the files in the folder where is placed the Dockerfile. In order to avoid slowness, check how to create a [.dockerignore](http://docs.docker.com/reference/builder/#the-dockerignore-file) file and remove useless files from the build process.

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
// We can define different tags which allows us to pick different
// versions of the repository (https://registry.hub.docker.com/u/azukiapp/azktcl/)
image: { docker: "azukiapp/azktcl:0.0.1" },
image: { docker: "azukiapp/azktcl:0.0.2" },

// All settings below point to the same image,
// that is, multiple tags can point to the same image.
// Note that for the official docker images, it is not
// necessary to inform the namespace (library, in this case).
image: { docker: "node:0" },
image: { docker: "azukiapp/node" },
image: { docker: "node:latest" },
// library/ is optional only in this case, for the standard Docker repositories
image: { docker: "library/node:latest" },
```
