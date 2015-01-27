## scalable

Define quantas instâncias do sistema devem ser levantadas quando o comando `azk start` for rodado.

#### Uso:

```js
scalable: { default: NUM, limit: NUM },
```

##### Exemplos:

* (__padrão__) Uma instância por padrão, e limitado apenas a uma instância:

  ```js
  scalable: { default: 1, limit: 1 },
  ```

* Nenhuma instância por padrão, ou seja, não será levantado pelo `azk start`:

  ```js
  scalable: { default: 0 },
  ```

* Apenas uma instância:

  ```js
  scalable: { default: 1 },
  ```

* Quatro instâncias por padrão:

  ```js
  scalable: { default: 4 },
  ```

