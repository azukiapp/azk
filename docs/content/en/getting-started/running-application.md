# Running the application

Once the `Azkfile.js` is created, we are ready to start our application:

```bash
$ azk start -vv
```

The output of the command above should look something like this:

```bash
azk: ↑ starting `azkdemo` system, 2 new instances...
azk: ✓ checking `dockerfile/nodejs:latest` image...
azk: ⇲ downloading `dockerfile/nodejs:latest` image...
// download progress output...
  9a76e1635147: Download complete
azk: ↻ provisioning `azkdemo` system...
npm WARN package.json azk-hello@0.0.1 No repository field.
// long output
// download node dependences ...
azk: ◴ waiting start `azkdemo` system, try connect port http/tcp...
azk: ◴ waiting start `azkdemo` system, try connect port http/tcp...

┌───┬────────┬────────────┬───────────────────────┬────────────────────────────┬───────────────────┐
│   │ System │ Instances  │ Hostname              │ Instances-Ports            │ Provisioned       │
├───┼────────┼────────────┼───────────────────────┼────────────────────────────┼───────────────────┤
│ ↑ │ azkiso │ 2          │ http://azkdemo.azk.dev│ 2-http:49154, 1-http:49153 │ a few seconds ago │
└───┴────────┴────────────┴───────────────────────┴────────────────────────────┴───────────────────┘
```

If all went as expected now you can access [http://azkdemo.azk.dev](http://azkdemo.azk.dev) and the following screen should appear:

![Figure 1-1](../resources/images/start_1.png)

Note that when you refresh the page a few times the `instance id` is changed to another value. This happens because there is a load balancer that points to one of two instances of the site.

In the output of `azk status` we can check that there are two instances of the azkdemo system:

```
$ azk status

┌───┬─────────┬────────────┬────────────────────────┬────────────────────────────┬───────────────┐
│   │ System  │ Instances  │ Hostname               │ Instances-Ports            │ Provisioned   │
├───┼─────────┼────────────┼────────────────────────┼────────────────────────────┼───────────────┤
│ ↑ │ azkdemo │ 2          │ http://azkdemo.azk.dev │ 2-http:49168, 1-http:49167 │ 3 minutes ago │
│   │         │            │                        │                            │               │
└───┴─────────┴────────────┴────────────────────────┴────────────────────────────┴───────────────┘
```

This setting, to use two instances, is defined in the Azkfile.js (generated in the [previous step](configs-project.md)):

    scalable: {"default": 2},