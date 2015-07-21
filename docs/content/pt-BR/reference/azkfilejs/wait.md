## wait

Representa o tempo total de espera da conexão com a porta a ser disponibilizada pelo sistema.
Caso não haja nenhuma resposta do container será disparado um erro por _timeout_.

#### Uso:

```js
wait: [TEMPO_MAXIMO_TIMEOUT_EM_SEGUNDOS],
```

##### Forma antiga

Esta forma antiga de configurar a opção `wait` apenas multiplica o `retry` e o `timeout`.

```js
// esta forma deixará de ser utilizada
wait: { retry: [NUM_TENTATIVAS], timeout: [TEMPO_EM_MILISEGUNDOS] },
```

##### Exemplos:

Tentará conectar por 20 segundos:

```js
wait: 20,
```

Tentará conectar por 20 segundos:

```js
// esta forma deixará de ser utilizada
wait: { retry: 10, timeout: 2000 },
```

Tentará conectar por 20 segundos:

```js
// esta forma deixará de ser utilizada
wait: { retry: 20, timeout: 1000 },
```
