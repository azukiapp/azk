## mounts

Configura quais pastas serão internalizadas ao container ou persistidas internamente pelo `azk`.

Utilizando Linux, a informação persistida internamente é salva dentro de `~/.azk/data/persistent_folders`. No Mac, a informação se encontra no disco de dados da sua máquina virtual. Ao utilizar o mesmo parâmetro com a opção `persistent`, é possível compartilhar informações (por exemplo, um banco de dados) entre aplicações.

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
