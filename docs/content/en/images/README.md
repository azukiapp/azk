# Images

`azk` uses preconfigured images with different languages and databases to automate the setup of the development environment. These images follow the pattern from Docker and can be found in [http://images.azk.io](http://images.azk.io).


### What are these images?

The images are the basis of the systems described in the [Azkfile.js](../azkfilejs/README.md). The [image](../reference/azkfilejs/image.md) property is the starting point for the systems installation. Images can be of type [docker](../reference/azkfilejs/image.html#docker) or [dockerfile](../reference/azkfilejs/image.html#dockerfile). When the system image is set to [docker](../reference/azkfilejs/image.html#docker) it is downloaded directly from the **[Docker Registry](https://registry.hub.docker.com/)**. When set to [dockerfile](../reference/azkfilejs/image.html#dockerfile), a local file will be fetched.


### Docker Registry

[Docker Registry](https://registry.hub.docker.com/) is a public repository of images to use with Docker. Take for example the node.js image suggested by `azk`: `azukiapp/node`. It points to [Azuki's repository in the Docker Registry](https://registry.hub.docker.com/u/azukiapp/node/).

Checking the `FROM` parameter inside the `Dockerfile` of [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile), we can see that the image is based off of the image `azukiapp/web-based` which, in turn, is based off of another image, `azukiapp/ubuntu`.

```
...
FROM azukiapp/web-based
MAINTAINER Azuki <support@azukiapp.com>
...
```

Inheritance chain of [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile):

- [azukiapp/node](https://github.com/azukiapp/docker-node/blob/master/0.10/Dockerfile)
- [azukiapp/web-based](https://github.com/azukiapp/docker-web-based/blob/master/Dockerfile)
- [azukiapp/ubuntu](https://github.com/azukiapp/docker-ubuntu/blob/master/Dockerfile)
- [library/ubuntu](https://github.com/tianon/docker-brew-ubuntu-core/blob/a9da4b3cd8977c2aacafe5d9d0056cbb360f2d1c/trusty/Dockerfile)
- [library/scratch](https://registry.hub.docker.com/u/library/scratch/)

That way we can take advantage of the configuration of the base image (shown in the `FROM` parameter) to create standardized and useful images for `azk` needs.

### Local Dockerfile

Besides pointing to [images](../reference/azkfilejs/image.html) from the Docker registry, we can still customize our own images using a [local dockerfile](../reference/azkfilejs/image.html#dockerfile). That way we can create completely custom images and test them locally.

We recommend that after the appropriate configuration, to facilitate teamwork, the image is sent to the [Docker Registry](https://registry.hub.docker.com/). That way other developers of your project will have easy access to the same environment as you.

Always use a Dockerfile to create images. This allows other people interested in using your image to see how it was built.

> Warning: never upload sensitive data on your images to a public [Docker Registry](https://registry.hub.docker.com/);

