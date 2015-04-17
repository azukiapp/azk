## export_envs

Exporta variáveis de ambiente do sistema atual para os sistemas que dependem dele.

#### Uso:

```js
export_envs: {
  ENV_NAME_1: 'ENV_VALUE_1',
  ENV_NAME_2: 'ENV_VALUE_2',
  ...,
  ENV_NAME_N: 'ENV_VALUE_N',
},
```

##### Exemplos:

Exporta uma variável de ambiente `REDIS_URL` do sistema `redis_system` para o sistema `sys1`, pois este depende do banco de dados [Redis][redis].

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
