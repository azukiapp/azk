## mounts

`mounts` possui duas maneiras de uso: `path` e `persistent`. Elas são usadas para configurar quais pastas serão internalizadas ao container ou persistidas internamente pelo `azk`.

#### path

```js
'INTERNAL_FOLDER': path('LOCAL_PATH'),
```

Monta a pasta localizada no sistema atual em `LOCAL_PATH`, relativo ao Azkfile.js, a pasta `INTERNAL_FOLDER` dentro do contêiner. Caso algum arquivo seja alterado, a partir da máquina do usuário ou de dentro do contêiner, a informação também é atualizado no outro lado.

#### persistent

```js
'INTERNAL_FOLDER': path('LOCAL_PATH'),
```

Persiste os arquivos dentro do contêiner no caminho `INTERNAL_FOLDER`, para uma pasta persistente do `azk` dentro da máquina do usuário. O local dessa pasta varia entre Mac e Linux:

###### Mac

`/Users/heitorsergent/.azk/data/vm/azk-agent.vmdk.link`
`~/.azk/data/persistent_folders/#{manifest.id}/LOCAL_PATH`.
 
###### Linux

`~/.azk/data/persistent_folders/#{manifest.id}/LOCAL_PATH`.

Note que utilizar o mesmo 'LOCAL_PATH' no mesmo Azkfile.js, mas em contêiners diferentes, significa que eles irão compartilhar dados persistidos.

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

* __persistent__: Persiste os arquivos de dentro do container que estão no caminho `/azk/bundler`. Estes arquivos, geralmente, ficam guardados na _máquina host_ na pasta `~/.azk/data/persistent_folders/_ALGUM_ID_`.

  ```js
  mounts: {
    '/azk/bundler'          : persistent('bundler'),
  },
  ```
