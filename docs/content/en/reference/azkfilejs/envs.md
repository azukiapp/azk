## envs

Includes environment variables in the context of the container instance.

#### Usage:

```js
envs: {
  ENV_NAME_1: 'ENV_VALUE_1',
  ENV_NAME_2: 'ENV_VALUE_2',
  ...,
  ENV_NAME_N: 'ENV_VALUE_N',
}
```

##### Examples:

We can expose some variables to set up a [Postgres][postgres] database, for example:

```js
envs: {
  POSTGRESQL_USER: "admin",
  POSTGRESQL_PASS: "password",
  POSTGRESQL_DB  : "awesome_db",
  POSTGRESQL_HOST: "#{net.host}",
  POSTGRESQL_PORT: "#{net.port.data}",
}
```

> __Important__: This is not the recommended way to expose sensitive information such as passwords. It is recommended that each developer uses a .env file in the root of the project and that this file is ignored in version control.

!INCLUDE "../../../links.md"
