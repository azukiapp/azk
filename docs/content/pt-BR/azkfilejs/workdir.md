## workdir

Diz ao azk qual será a pasta inicial do sistema em questão para rodar os _comandos_, _provisionamentos_ e o _shell_ dentro do container.

#### Uso:

```js
workdir: 'CAMINHO_COMPLETO',
```

##### Exemplos:

Geralmente o `workdir` vem configurado para `/azk/#{manifest.dir}`, que, em conjunto com o `mounts`, indica a pasta do _host_ onde está o `Azkfile.js`.

```js
workdir: '/azk/#{manifest.dir}',

mounts: {
  '/azk/#{manifest.dir}'  : path('.'),
},
```
