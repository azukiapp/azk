## envs

Inclui variáveis de ambiente no contexto da instância do container.

#### Uso:

```js
envs: {
  ENV_NAME_1: 'ENV_VALUE_1',
  ENV_NAME_2: 'ENV_VALUE_2',
  ...,
  ENV_NAME_N: 'ENV_VALUE_N',
}
```

##### Exemplos:

Podemos expor algumas variáveis para configurar um banco de dados [Postgres][postgres], por exemplo:

```js
envs: {
  POSTGRESQL_USER: "admin",
  POSTGRESQL_PASS: "senha",
  POSTGRESQL_DB  : "projeto_development",
  POSTGRESQL_HOST: "#{net.host}",
  POSTGRESQL_PORT: "#{net.port.data}",
}
```

> __Importante__: Esta não é a forma recomendada de se expor informações confidenciais, como senhas. Recomenda-se que cada desenvolvedor tenha um arquivo .env na raiz do projeto e este arquivo seja ignorado no controle de versão.

!INCLUDE "../../../links.md"
