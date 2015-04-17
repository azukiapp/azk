## export_envs

Export environment variables of the current system for systems that depend on it.

#### Usage:

```js
export_envs: {
  ENV_NAME_1: 'ENV_VALUE_1',
  ENV_NAME_2: 'ENV_VALUE_2',
  ...,
  ENV_NAME_N: 'ENV_VALUE_N',
},
```

##### Examples:

Exports an environment variable `REDIS_URL` from the system `redis_system` to the system `sys1`, as this depends on the [Redis][redis] database.

```js
sys1: {
  deps: 'redis_system'
},
redis_system: {
  export_envs: {
    REDIS_URL: "redis://#{net.host}:#{net.port.data}/#{manifest.dir}"
  },
}
```

!INCLUDE "../../../links.md"
