```js
// Adds the systems that shape your system
systems({
  azkdemo: {
    // ...
  },
  // Adds the "redis" system
  redis: {
    image: { docker: "redis" },
    export_envs: {
      "DATABASE_URL": "redis://#{net.host}:#{net.port[6379]}"
    }
  }
});
```
