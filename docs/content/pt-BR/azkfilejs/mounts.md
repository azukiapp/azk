## mounts

Configura quais pastas serão internalizadas ao container ou persistidas internamente pelo `azk`.

#### Uso:

```js
mounts: {
  'INTERNAL_FOLDER': path('CAMINHO_LOCAL'),
  'INTERNAL_FOLDER': persistent('ID_DA_PASTA'),
},
```

##### Exemplos:

* __path__: Monta a pasta atual do projeto (`'.'`) com o nome da pasta onde está o `Azkfile.js`. Por exemplo, se estivermos na pasta `/home/projetos/azkdemo`, dentro do container nossos arquivos estarão em `/azk/azkdemo`.

```js
mounts: {
  '/azk/#{manifest.dir}'  : path('.'),
},
```

_________________
* __persistent__: Persiste os arquivos de dentro do container que estão no caminho `/azk/bundler`. Estes arquivos, geralmente, ficam guardados na _máquina host_ na pasta `~/.azk/data/persistent_folders/_ALGUM_ID_`.

```js
mounts: {
  '/azk/bundler'          : persistent('bundler'),
},
```
