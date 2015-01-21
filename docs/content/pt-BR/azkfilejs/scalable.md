## scalable

Define quantas instâncias do sistema devem ser levantadas.

#### Uso:

```js
scalable: { "default": NUM },
```

##### Exemplos:

Nenhuma instância por padrão, ou seja, não será levantado pelo azk start.

```js
scalable: { "default": 0 },
```

_____________
Apenas uma instância

```js
scalable: { "default": 1 },
```

_____________
Quatro instâncias por padrão

```js
scalable: { "default": 4 },
```
