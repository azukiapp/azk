## wait

Define o número e o tempo entre cada tentativa de conexão com a porta a ser disponibilizada pelo sistema. Caso não haja nenhuma resposta do container será disparado um erro por _timeout_.

#### Uso:

```js
wait: { retry: [NUM_TENTATIVAS], timeout: [TEMPO_ENTRE_TENTATIVAS_EM_MILISEGUNDOS] },
```

##### Exemplos:

10 tentativas com 2 segundos de pausa entre elas:

```js
wait: { retry: 10, timeout: 2000 },
```

20 tentativas com 1 segundo de pausa entre elas:

```js
wait: { retry: 20, timeout: 1000 },
```
