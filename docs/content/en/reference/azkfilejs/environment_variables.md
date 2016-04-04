# Environment variables

Generally, almost every application demands some sort of configuration. `azk` uses the [environment variables][environment_variable] (a.k.a. env vars) approach to configure systems.

Environment variables can be defined on 4 different places or, in some special cases, they can be automatically defined.

Below, those 4 places are described in order of processing. If a same environment variable is defined in more than one of those places, the latter definition prevails.

## From the images

As described [here](image.md), a system always requires an image. Either from an external repository or from a recipe file, an image can contain environment variables defined on it.

In the example below we have a Dockerfile that defines the environment variable `NAME`:

```Dockerfile
FROM azukiapp/alpine
ENV NAME=david
```

## In the `Azkfile`

In the [Azkfile](../../azkfilejs/README.md), each declared system can contain a property called [envs](envs.md), as in the example below:

```js
systems({
  web: {
    image: { dockerfile: "./" },
    envs: {
      NAME: "joe",
      APP_ENV: "development",
    }
  }
});
```

In this example, we're overriding the environment variable `NAME` declared in the previous example and adding a new one called `APP_ENV`.

## In the file `.env`

As per the reference of the property [envs](envs.md) of the `Azkfile`, it isn't recommended to put sensitive data (such as passwords, API keys, etc.) directly in the property `envs`.

As alternative, a `.env` file should be used in the folder that contains the `Azkfile`, as described in this [lib][dotenv_ref];

```sh
echo "API_KEY=FCB12" >> .env
echo "NAME=mike" >> .env
```

In this example, we're overriding the property `NAME` declared in the `Azkfile` of the previous example.

## Autoinserted

Currently, we have two cases in which environment variables are automatically inserted in the systems:

### Ports

Several environment variables are created from the system ports definition, which can be in the [Azkfile](ports.md) and/or in the used image.

The naming pattern for those variables is `[PORT_NAME|PORT_NUMBER]_PORT`, where:

- `PORT_NAME` is the name of the port defined in the `Azkfile`;
- `PORT_NUMBER` is the number of the port (used in the case where the port is defined in the image but isn't named in the `Azkfile`);

### HTTP port

The environment variable `HTTP_PORT` is inserted when the property [http](http.md) is defined in a system.

The default value of this variable is `5000`, but it's possible to change it by adding a port named `http` in the property `ports` of the `Azkfile`.

### From other systems

When you declare a system **A** depending on another system **B** (using the property [depends](depends.md)), the following environment variables are inserted in the system **A**:

- **port and host**: four variables for each port exposed by system **B**, in the following naming pattern:
    - `[B_SYSTEM_NAME]_[PORT_NAME]_PORT`
    - `[B_SYSTEM_NAME]_[PORT_NUMBER]_PORT`
    - `[B_SYSTEM_NAME]_[PORT_NAME]_HOST`
    - `[B_SYSTEM_NAME]_[PORT_NUMBER]_HOST`

- **export_envs**: all the environment variables defined in the property [export_envs](export_envs.md) of the system **B** are inserted in the system **A**;

## On the shell

Running the command [azk shell](../cli/shell.md), you can pass new environment variables and/or override any of the defined above.

```
azk shell web -e NAME=gullit -e FOO=bar
```

-----------------------------

## Auto expansion of variables

During the process of parsing and running of a system, the environment variables used in the declaration of the properties of a system are expanded to its values (according to the processing order previously described):

```js
systems({
  web: {
    image: { dockerfile: "./" },
    command: ["start.sh", "--name", "$NAME", "--port", "${HTTP_PORT}"],
    http: {
      domain: ["#{system.name}.#{azk.default_domain}"],
    },
    ports: {
      http: "3000/tcp",
    },
    envs: {
      NAME: "joe",
      APP_ENV: "development",
    }
  }
});
```

In this case, the resulting `command` will be:

```sh
start.sh --name joe --port 3000
```

!INCLUDE "../../../links.md"
