## depends

Identifica quais dependências são necessárias para que o sistema seja levantado. Ao iniciar o sistema que possui dependências, os sistemas a quem ele depende serão levantados automaticamente. Isto é bastante útil quando temos sistemas que dependem de banco de dados, por exemplo.

#### Uso:

```js
depends: ['SYSTEM_NAME_1', 'SYSTEM_NAME_2', /*..., */ 'SYSTEM_NAME_N'],
```

##### Exemplos:

Neste exemplo o `sys1` depende do `sys2` que depende do `sys3`. Ao se levantar o `sys1` este vai requisitar que o `sys2` seja levantado, porém este, como depende do `sys3`, vai fazer com que o azk levante o `sys3` em primeiro lugar. Apenas o `sys3` pode ser levantado isoladamente.

```js
sys1: {
  depends: ['sys2'],
},
sys2: {
  depends: ['sys3'],
},
sys3: {
  depends: [],
}
```

