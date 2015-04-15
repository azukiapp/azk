# Running our application

Our starter application comes pre-configured with an Azkfile.js containing our **Node.js system** and our **Redis system**.

Let's run it:

```sh
$ azk start
```

You should see the following output:

```
azk: ↑ starting `redis` system, 1 new instances...
azk: ✓ checking `library/redis:latest` image...
azk: ◴ waiting for `redis` system to start, trying connection to port 6379/tcp...
azk: ↑ starting `azkdemo-services` system, 1 new instances...
azk: ✓ checking `azukiapp/node:0.12` image...
azk: ◴ waiting for `azkdemo-services` system to start, trying connection to port http/tcp...

┌───┬─────────────────────┬───────────┬────────────────────────────────────┬─────────────────┬──────────────┐
│   │ System              │ Instances │ Hostname/url                       │ Instances-Ports │ Provisioned  │
├───┼─────────────────────┼───────────┼────────────────────────────────────┼─────────────────┼──────────────┤
│ ↑ │ redis               │ 1         │ dev.azk.io                         │ 1-6379:49351    │ -            │
├───┴─────────────────────┴───────────┴────────────────────────────────────┴─────────────────┴──────────────┤
│ ↑ │ azkdemo-services    │ 1         │ http://azkdemo-services.dev.azk.io │ 1-http:49352    │ -            │
└───┴─────────────────────┴───────────┴────────────────────────────────────┴─────────────────┴──────────────┘
```

Now if you open the URL http://azkdemo-services.dev.azk.io, you should see:

![azkdemo-start](../resources/images/azk-services-1.png)

With our application working, let's start by adding MailCatcher to it. :)
