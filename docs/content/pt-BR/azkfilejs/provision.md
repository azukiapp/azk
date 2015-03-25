## provision

Especifica alguns comandos para serem executados antes que o sistema esteja pronto para executar o `command`.

Esta sessão existe para dar uma oportunidade de executar comandos que dependam dos arquivos do projeto e desta
forma não poderiam ser executados no momento da criação da imagem. Coisas como instalação de dependências ou
execução de migrations.

_Obs_: É importante notar que esse não é o local para customização das imagens e qualquer informação que necessite ser persistida deve ser feita em pastas montadas.

#### Uso:

```js
provision: [
    'COMMAND 1',
    'COMMAND 2',
    ...,
    'COMMAND N'
],
```

##### Exemplos:

Para sistemas que utilizam __rails__ é comum que sejam executados o `bundle install` e o `rake db`.

```js
rails_system: {
  provision: [
    "bundle install --path /azk/bundler",
    "bundle exec rake db:create",
    "bundle exec rake db:migrate",
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": path("."),
    "/azk/bundler": persistent("bundler"),
  }
},
```

____________________
Para sistemas com __node.js__ geralmente utilizamos o `npm install` para instalar as dependências.

```js
node_system: {
  provision: [
    "npm install"
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": path("."),
    "/azk/#{manifest.dir}/node_modules": persistent("modules"),
  }
},
```

É importante observar que em ambos os casos (__rails__ e __node.js__), estamos utilizando pastas
persistentes para a "guarda" das dependencias e não pastas do "sistemas" que seriam perdidas após
a execução dos comandos do `provision`.
