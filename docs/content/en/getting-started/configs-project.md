# Setting up the project

The first step to use `azk` in any project is to create an `Azkfile.js` file. This file has the function to define the root directory of your project and also define the *application architecture*.

The `Azkfile.js` file can be created manually, but for your convenience we offer the `azk init` command, a `Azkfile.js` generator that will do the heavy lifting of figuring out how your application is designed and suggest an `Azkfile.js`.

```bash
$ cd [path_demo]/azkdemo
$ azk init

azk: [node010] A `node` system was detected at '[path_demo]/azkdemo'.
azk: [node010] The image suggested was `{"docker":"node:0.10"}`.
azk: 'Azkfile.js' generated
```

This should generate the following `Azkfile.js`:

!INCLUDE "../../common/getting-started/Azkfile_project_configure.md"

In the [Azkfile.js](../azkfilejs/README.md) section you can find detailed information on how to build an `Azkfile.js` and what options are available. For now, we have enough to run our application.
