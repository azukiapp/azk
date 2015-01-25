```js
systems({
  azkdemo: {
    // ...
    command: "npm start",
    mounts: {
      '/azk/#{manifest.dir}': path("."),
    },
    scalable: {"default": 2},
    // ..
  },
});
```