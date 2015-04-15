# Adding services

Before you begin, make sure you have [azk installed](../installation/README.md).

This guide assumes that you have followed the [Getting Started](../getting-started/README.md) section, and are already a little bit familiar with `azk` and editing the `Azkfile.js`.

One of the cool things that you can do with `azk` is to quickly add services to your application that can help with testing, or quickly adding extra functionality.

In this guide, we'll start with a simple Node.js application and add [MailCatcher](https://github.com/sj26/mailcatcher/) and [ngrok](https://ngrok.com/) to it. That will allow us to easily test out sending emails and capturing the information contained inside it, and also test webhooks with a live application URL.


## Getting the sample project

To start off, let's download the sample project we'll use as a basis for the next steps. You can either:

*Clone the repository:*

```sh
$ git clone https://github.com/azukiapp/azkdemo-services
```

or

*Download the project as a compressed file:*

```sh
$ curl -L https://github.com/azukiapp/azkdemo-services/archive/master.zip -o azkdemo-services.zip
$ unzip azkdemo-services.zip
$ mv azkdemo-services-master azkdemo-services
```

> ** Note **: All commands `cd [path_demo]/azkdemo-services` in this guide, take into account that `[path_demo]/` is the path where the file above was extracted, be careful to always point to the correct path. ;)
