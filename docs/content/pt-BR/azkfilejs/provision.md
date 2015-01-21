## provision

Especifica alguns comandos para serem executados antes que o sistema esteja pronto para executar o `command`. Para tarefas muito pesadas.

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
},
```

____________________
Para sistemas com __node.js__ geralmente utilizamos o `npm install` para instalar as dependências.

```js
node_system: {
  provision: [
    "npm install"
  ],
},
```

