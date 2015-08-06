## mounts

`mounts` possui três maneiras de uso: `path`, `persistent` e `sync`. Elas são usadas para configurar quais pastas serão internalizadas ao container ou persistidas internamente pelo `azk`.

#### path

```js
'INTERNAL_FOLDER': path('LOCAL_PATH'),
```

Monta a pasta localizada no sistema atual em `LOCAL_PATH`, relativo ao Azkfile.js, na pasta `INTERNAL_FOLDER` dentro do contêiner. Caso algum arquivo seja alterado a partir da máquina do usuário ou de dentro do contêiner, a informação também é atualizada do outro lado.

#### persistent

```js
'INTERNAL_FOLDER': persistent('LOCAL_PATH'),
```

Persiste os arquivos dentro do contêiner no caminho `INTERNAL_FOLDER` para uma pasta persistente do `azk` dentro da máquina do usuário. O local dessa pasta varia entre Mac e Linux:

###### Mac

A pasta encontra-se no disco virtual (`~/.azk/data/vm/azk-agent.vmdk`), no diretório `/azk/persistent_folders`. Esse disco é montado no caminho `/mnt/sda1` da VM.

###### Linux

`~/.azk/data/persistent_folders/#{manifest.id}/LOCAL_PATH`.

Note que utilizar o mesmo 'LOCAL_PATH' no mesmo Azkfile.js, mas em sistemas diferentes, significa que esses sistemas compartilharão os dados persistidos.

#### sync

```js
'INTERNAL_FOLDER': sync('LOCAL_PATH' [, OPTS]),
```

Sincroniza os arquivos presentes em `LOCAL_PATH` com o destino remoto, o qual é montado dentro do container na pasta `INTERNAL_FOLDER`. Diferentemente da opção `path`, a `sync` utiliza [rsync](https://rsync.samba.org/) ao invés das [pastas compartilhadas](https://www.virtualbox.org/manual/ch04.html#sharedfolders) do VirtualBox. Como resultado, há um significativo ganho de performance, principalmente em aplicações que demandam um grande número de arquivos (e.g. uma aplicação Ruby on Rails que possui um grande número de assets).

##### OPTS (opcional)

* `except`: um `Array` de arquivos e/ou pastas a serem ignoradas no processo de sincronização. Esta opção usa [glob patterns](http://teaching.idallen.com/dat2330/06w/notes/glob_patterns.txt). Dicas úteis:
  * **Ignorar um arquivo**: `{except: ["./caminho/para/o/arquivo.png"]}`
  * **Ignorar uma pasta**: `{except: ["./caminho/para/a/pasta/"]}` // *Lembre-se da `/` no final!*
  * **Ignorar todos os arquivos CSS**: `{except: ["*.css"]}`

  > Por padrão, o `azk` já ignora os seguintes elementos: `.syncignore`, `.gitignore`, `Azkfile.js`, `.azk/` and `.git/`.

* `daemon`: um valor `boolean` que infica se, ao rodar o `azk` no modo daemon (e.g. `azk start`), o `azk` deve ou não utilizar o `sync` (em caso negativo, será utilizado a opção de `path`) (valor padrão: `true`);
* `shell`: de modo similar à opção `daemon`, a opção `shell` é um  valor `boolean` que indica se, ao rodar o `azk` no modo daemon (e.g. `azk start`), o `azk` deve ou não utilizar o `sync` (em caso negativo, será utilizado a opção de `path`) (valor padrão: `false`). Utilizar o valor `false` é útil para manter a sincronização em ambos os sentidos, permitindo assim que arquivos criados dentro do shell (e.g. via `$ rails generate scaffold User name:string`) sejam persistidos de volta na pasta original do projeto.

##### Persistência dos dados
Utilizando o `sync`, é preciso garantir que os dados gerados pelo [`provision`](/pt-BR/reference/azkfilejs/provision.html) serão persistidos. Para isso, deve-se adicionar aos mounts uma entrada de `persistent` com a pasta correspondente. Essas pastas variam entre linguagens e frameworks, mas seguem alguns exemplos:

* __Ruby/Rails__:
  ```js
  mounts: {
    '/azk/#{manifest.dir}'         : sync("."),
    '/azk/bundler'                 : persistent("bundler"),
    '/azk/#{manifest.dir}/tmp'     : persistent("tmp"),
    '/azk/#{manifest.dir}/.bundle' : path(".bundle"),
    '/azk/#{manifest.dir}/log'     : path("log"),
  },
  ```

* __Node.js__:
  ```js
  mounts: {
    '/azk/#{manifest.dir}' : sync('.'),
    '/azk/node_modules'    : persistent('node_modules'),
  },
  ```

##### Pastas ignoradas
Quando você usa o `sync` para uma pasta, o `azk` começa a monitorar seus arquivos para ressincronizar aqueles que foram modificados, assim que a mudança acontecer. Uma vez que essa pasta contenha muitos arquivos, o consumo de CPU pode aumentar drasticamente. A melhor maneira de evitar isso é fazendo o `azk` ignorar, durante o processo de sincronização, quaisquer pastas que não sejam estritamente necessárias para o sistema rodar. Você pode fazer isso das seguintes maneiras:

* Utilizando a opção `except` listada acima;
* Criando, dentro da pasta que está sendo sincronizada, um arquivo chamado `.syncignore` que contém uma lista de todos arquivos e pastas a serem ignorados durante o processo de sincronização (e.g. se você está fazendo `sync(./MeuProjeto)`, o `azk` vai procurar o arquivo `./MeuProjeto/.syncignore`);
* Se você não tiver o arquivo `.syncignore`, por padrão o `azk` írá ignorar todos os arquivos e pastas listados no arquivo `.gitignore` (dentro da pasta que está sendo sincronizada) durante o processo de sincronização (e.g. analogamente, se você está fazendo `sync(./MeuProjeto)`, o `azk` vai procurar o arquivo `./MeuProjeto/.gitignore`).

##### Diretório de destino da sincronização

O diretório de destino da sincronização varia entre Mac e Linux:

###### Mac

A pasta encontra-se no disco virtual (`~/.azk/data/vm/azk-agent.vmdk`), no diretório `/azk/sync_folders`. Esse disco é montada no caminho `/mnt/sda1` da VM.

###### Linux

`~/.azk/data/sync_folders/#{manifest.id}/LOCAL_PATH`.

Note que utilizar o mesmo 'LOCAL_PATH' no mesmo Azkfile.js, mas em contêiners diferentes, significa que eles irão compartilhar os dados sincronizados.

> **NOTA IMPORTANTE:** Se você estiver enfrentando problemas de performance ao usar o `azk` com sua aplicação, você deve utilizar a opção de `sync` quando for montar a pasta onde está seu código fonte. Vale lembrar que a sincronização é somente em um sentido, portanto é preciso adicionar o `mounts` as entradas com as pastas que devem utilizar a opção de compartilhamento de arquivos (usando as opções `path` ou `persistent`).

### Exemplos

* __path__: Monta a pasta atual do projeto (`'.'`) dentro do contêiner na pasta `/azk/azkdemo` (considerando que `azkdemo` é o nome da pasta onde está o `Azkfile.js`).

  ```js
  mounts: {
    '/azk/#{manifest.dir}' : path('.'),
  },
  ```

* __persistent__: Persiste os arquivos de dentro do container que estão no caminho `/azk/bundler`. Estes arquivos, nesse caso, ficarão guardados na _máquina host_ na pasta `~/.azk/data/persistent_folders/_ALGUM_ID_`.

  ```js
  mounts: {
    '/azk/bundler' : persistent('bundler'),
  },
  ```

* __sync__: Sincroniza os arquivos do projeto dentro do contêiner na pasta `/azk/azkdemo` (considerando que `azkdemo` é o nome da pasta onde está o `Azkfile.js`), excluindo arquivos CSS e a pasta `config`. Além disso, usa compartilhamento de arquivos para as pastas `tmp` e `log`.

  ```js
  mounts: {
    '/azk/#{manifest.dir}'      : sync('.', except: ['*.css', 'config/']),
    '/azk/#{manifest.dir}/tmp'  : persistent('tmp/'),
    '/azk/#{manifest.dir}/log'  : persistent('log/'),
  },
  ```
