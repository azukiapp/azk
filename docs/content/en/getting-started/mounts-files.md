# Mapping files

Se observarmos o `Azkfile.js` gerado, é possível notar uma entrada no sistema `azkdemo` chamada `mounts`:

If we look at the generated `Azkfile.js`, you can see an entry in the `azkdemo` system called `mounts`:

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

This entry basically guides `azk` on which local files should be available to your application in the isolated environment where it will run. In this case, the current directory, which is the `azkdemo` folder, will be available in the path `/azk/azkdemo` within the isolated environment.

If we access the **shell** of the `azkdemo` system you can list the files of the `azkdemo` folder as expected:

![Figure 1-1](../resources/images/ls.png)

Note that when you run `azk shell`, you were sent to folder `/azk/azkdemo`, this _path_ corresponds to the `workdir` entry of the Azkfile.js, which has the value: `/azk/#{system.name}`.

The `#{system.name}` is a notation that lets you know the name of a system when it is stating the options of that same system inside the `Azkfile.js` file. In the example at the beginning of this session the value will be expanded to `azkdemo`.