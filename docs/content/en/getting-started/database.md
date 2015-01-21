# Databases

Our demo application shows a simple visit counter, but, before that, you need to set up a database where the application can save this visit count.

Installing and configuring a database in `azk` is very simple. First you must edit the `Azkfile.js` file and add a new entry in `systems` referring to the database. In this case we will use __redis__:

```js
// Adds the systems that shape your system
systems({
  azkdemo: {
    // ...
  },
  // Adds the "redis" system
  redis: {
    image: "redis",
    export_envs: {
      "DATABASE_URL": "redis://#{net.host}:#{net.port[6379]}"
    }
  }
});
```

Once this is done it's possible to start the new system and have access to the database:

```bash
$ azk start redis
azk: ↑ starting `redis` system, 1 new instances...
azk: ✓ checking `dockerfile/redis:latest` image...
azk: ◴ waiting start `redis` system, try connect port 6379/tcp...

┌───┬────────┬────────────┬──────────┬─────────────────┬─────────────┐
│   │ System │ Instances  │ Hostname │ Instances-Ports │ Provisioned │
├───┼────────┼────────────┼──────────┼─────────────────┼─────────────┤
│ ↑ │ redis  │ 1          │ azk.dev  │ 1-6379:49157    │ -           │
└───┴────────┴────────────┴──────────┴─────────────────┴─────────────┘
```

# Configuring application

For our sample application to be able to connect to the database we must first **install the library** connection to the database.

We must remember, in `azk` the installation of dependencies is always done in an "**isolated environment**", so we'll call the **shell** of `azk` for installation:

```bash
$ azk shell azkdemo

[ root@3848e1df91cf:/azk/azkdemo ]$ npm install redis --save
npm WARN package.json azk-hello@0.0.1 No repository field.
redis@0.12.1 node_modules/redis

[ root@3848e1df91cf:/azk/azkdemo ]$ exit
```

# Connecting systems

Once the database is already installed and we have the necessary dependencies to access it, we can configure our application that relies on the database. This will cause the `redis` system to start before the `azkdemo` application. Edit `Azkfile.js`:

```js
// Adds the systems that shape your system
systems({
  azkdemo: {
    // Dependent systems
    depends: ["redis"], // <= adicione o redis
    // ...
  },
  redis: {
    // ...
  }
});
```

Now we just restart the `azkdemo` system and the counter should appear:

```bash
$ azk restart azkdemo
azk: ↓ stopping `azkdemo` system, 2 instances...
azk: ↑ starting `azkdemo` system, 2 new instances...
azk: ✓ checking `dockerfile/nodejs:latest` image...
azk: ◴ waiting start `azkdemo` system, try connect port http/tcp...
azk: ◴ waiting start `azkdemo` system, try connect port http/tcp...

┌───┬─────────┬────────────┬────────────────────────┬────────────────────────────┬───────────────┐
│   │ System  │ Instances  │ Hostname               │ Instances-Ports            │ Provisioned   │
├───┼─────────┼────────────┼────────────────────────┼────────────────────────────┼───────────────┤
│ ↑ │ azkdemo │ 2          │ http://azkdemo.azk.dev │ 2-http:49164, 1-http:49163 │ 6 minutes ago │
└───┴─────────┴────────────┴────────────────────────┴────────────────────────────┴───────────────┘
```

Accessing [http://azkdemo.azk.dev](http://azkdemo.azk.dev) you will see:

![Figure 1-1](../resources/images/start_2.png)
