# FAQ

1. [What are the requirements for using azk?](README.html#what-are-the-requirements-for-using-azk)
1. [What's the difference between azk and docker-compose (Fig)?](README.html#whats-the-difference-between-azk-and-docker-compose-fig)
1. [What's the difference between azk and Vagrant, or Chef?](README.html#whats-the-difference-between-azk-and-vagrant-or-chef)
1. [My program is working fine with azk. Is there any way to deploy my environment?](README.html#my-program-is-working-fine-with-azk-is-there-any-way-to-deploy-my-environment)
1. [Inside the Azkfile.js, what's the difference between image, provision and command?](README.html#inside-the-azkfilejs-whats-the-difference-between-image-provision-and-command)
1. [Why should I use the images suggested by `azk init`?](README.html#why-should-i-use-the-images-suggested-by-azk-init)
1. [The image suggested by azk is not in the way I want it, what should I do?](README.html#the-image-suggested-by-azk-is-not-in-the-way-i-want-it-what-should-i-do)
1. [I cannot find the image I want in the Docker Hub, what do I do now?](README.html#i-cannot-find-the-image-i-want-in-the-docker-hub-what-do-i-do-now)
1. [Why is it that when I change folders I can no longer see the systems raised with the `azk status` command?](README.html#why-is-it-that-when-i-change-folders-i-can-no-longer-see-the-systems-raised-with-the-azk-status-command)
1. [What is the advantage of using multiple systems, each in a separate container?](README.html#what-is-the-advantage-of-using-multiple-systems-each-in-a-separate-container)
1. [I have used several images with azk that I do not use any more. They are taking up too much disk space, how do I delete them?](README.html#i-have-used-several-images-with-azk-that-i-do-not-use-any-more-they-are-taking-up-too-much-disk-space-how-do-i-delete-them)
1. [How do I create an application (npm, rails, etc.), without having the language or framework installed on my machine?](README.html#how-do-i-create-an-application-npm-rails-etc-without-having-the-language-or-framework-installed-on-my-machine)
1. [I'm having completion and encoding problems when running `azk shell`. How do I fix it?](README.html#im-having-completion-and-encoding-problems-when-running-azk-shell-how-do-i-fix-it)

#### What are the requirements for using azk?

Linux:
- Docker

Mac:
- Virtualbox

When running azk on Mac, you do not need to manually install Docker since we take care of it. In this case you have access to docker in your terminal via the `adocker` command. Because Linux does not need a virtual machine to run azk, its performance in it is higher than what's achieved on Mac.

#### What's the difference between azk and docker-compose (Fig)?

`azk`:

- Is not only focused in Docker, although it only supports it for the moment;
- Has an integrated http load balancer, which makes it easier to test if your application is "stateless";
- Has an integrated DNS service which helps when developing multiple applications without having to remember which `localhost` port they're using. Also including Linux support with the lib: [libnss-resolver](https://github.com/azukiapp/libnss-resolver);
- Has the concept of provisioning, which allows commands to be executed automatically before the creation of the container, without changing the original image. This is suitable for installing dependencies or migrating databases, for example;
- Uses a more robust manifest file, called `Azkfile.js`, which is built using a DSL JavaScript that makes its creation more flexible.

#### What's the difference between azk and Vagrant, or Chef?

Explaining in a succint way:

- `Vagrant` provides a way to describe and generate identical virtual machines (or even containers more recently). It can work together with a software configuration tool (eg Chef) to continue a machine setup process, after the system installation is complete.

- `Chef`, as mentioned above, is a tool for software configuration. It will help automate the process of setting up a machine, after it is started. For example, it can help with configuration files, installed programs, users, among other features. Chef, like other similar projects, also helps in the orchestration process to send changes in a system to specific machines.

azk, and Docker as well, both overlap with Vagrant and Chef in certain aspects. With azk you can define how applications/services that make up your project relate, and how your project should be executed. This is done within the `Azkfile.js`, in a clear and succinct way to facilitate communication between development and operations (DevOps), and make the whole deployment process something transparent to both teams. In addition, particularly because of the use of containers, testing applications in development and production becomes something much more reliable and reduces the chances of the famous "but it works on my machine".

Finally, `azk` focuses on the approach of describing a system's architecture from a functional point of view, which means you describe the various "micro-services" that make up the whole system. This is different from a systems architecture approach, such as `Vagrant`, where the focus is on the description of virtual machines;

#### My program is working fine with azk. Is there any way to deploy my environment?

We are working on a deployment solution. Stay tuned. ;)

#### Inside the Azkfile.js, what's the difference between image, provision and command?

The `image` property defines which docker binary image is going to be used as the starting point for the system setup. `provision` is executed once before the system is started, and` command` defines how to start the system so that it is exposed to the user or to another system.

#### Why should I use the images suggested by `azk init`?

The suggestions made by the command `azk init` are tested by the `azk` team. They meet our quality standards to ensure integration and stability with our tool, and also have the Dockerfiles available so you can check everything that is being installed on the system.

#### The image suggested by azk is not in the way I want it, what should I do?

You can find other images in:
- [Azuki images repository](http://images.azk.io/)
- [Azuki images repository in Docker Hub](https://registry.hub.docker.com/u/azukiapp)
- [Docker Hub](https://registry.hub.docker.com/)

#### I cannot find the image I want in the Docker Hub, what do I do now?

In this case, the alternative is to create your own Dockerfile to build your image, by following the instructions in: https://docs.docker.com/reference/builder

In addition, it makes sense to use your own Dockerfile if:

- You know the exact, and unique, requirements of the development environment required for your application;
- You want to add specific dependencies of your project to existing images;
- You need to optimize the size of an image compared to what is currently available.

#### Why is it that when I change folders I can no longer see the systems raised with the `azk status` command?

The command `azk status` among others (` start and stop restart` etc.) are related to the `Azkfile.js` in the current folder, or parent folders (just like `'.gitignore`, for example). When switching folders `azk` understands that you want to work on another system. So for us to run `azk stop` in a system that has been running with `azk start`, we need to return to the folder containing the system `Azkfile.js`, or to its subfolders.

#### What is the advantage of using multiple systems, each in a separate container?

To answer this question, it's worth reading more about micro-services in this great article: http://martinfowler.com/articles/microservices.html

#### I have used several images with azk that I do not use any more. They are taking up too much disk space, how do I delete them?

You can list the images you have using the command:

```sh
$ adocker images
```

To delete an image, just run:

```sh
$ adocker rmi azukiapp/node:0.10
```

By listing the images, some of them may appear with the name `<none>`. These are "lost" images. This may happen for a number of reasons, among them it could be that a container was still running when a new version was removed, for example. To remove all at once run:

```sh
adocker rmi --force `adocker images | grep "<none>" | awk '{ print $3 }'`
```

#### How do I create an application (npm, rails, etc.), without having the language or framework installed on my machine?

You can create a container using the image of the language/framework that you want, access it using the command `azk shell --image [docker-registry-image]`, and create your application inside.

Example of generating a rails application:

```sh
$ azk shell --image azukiapp/ruby --shell /bin/bash
# gem install rails --no-rdoc --no-ri
# rails new my-app
# exit
```

Afterwards you can create a `Azkfile.js` by accessing the application folder:

```sh
$ cd my-app
$ azk init
```

#### I'm having completion and encoding problems when running `azk shell`. How do I fix it?

By default, when `azk shell` is executed, `/bin/sh` is used for the terminal. This happens because not all images have `/bin/bash` installed.

If the image you are using has `/bin/bash` installed, edit your` Azkfile.js` and add `shell: "/bin/bash"` for your system. Or, use the `--shell` option in the command `azk shell`:

```shell
$ azk shell --shell=/bin/bash
```
