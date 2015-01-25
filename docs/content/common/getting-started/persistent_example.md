```js
systems({
  azkdemo: {
    // ...
  },
  redis: {
    image: "redis",
    // <-- add command and mounts
    command: "redis-server --appendonly yes",
    mounts: {
      "/data": persistent("data"),
    },
    export_envs: {
      "DATABASE_URL": "redis://#{net.host}:#{net.port[6379]}"
    }
  }
});
```