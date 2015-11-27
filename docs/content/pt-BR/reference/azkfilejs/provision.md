## provision

Especifica uma lista de comandos para serem executados antes que o sistema esteja pronto para executar o `command`.

Esta propriedade existe para dar uma oportunidade de executar comandos que dependam dos arquivos do projeto e desta forma não poderiam ser executados no momento da criação da imagem. Coisas como instalação de dependências ou execução de migrations são bons candidatos para essa propriedade.

### Observações

- O `provision` é executado como um único comando resultado da concatenação da lista de comandos, separados por ` && `, sendo assim todos os comandos devem retornar 0 para que o `provision` seja considerado executado com sucesso. Do contrário ele vai falhar e exibir a saída dos comandos executados;

- É importante notar que esse não é o local para customização das imagens e qualquer informação que necessite ser persistida deve ser feita em pastas montadas.

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

Para sistemas que utilizam __rails__ é comum que sejam executados o `bundle install` e o `rake db:migrate`.

```js
rails_system: {
  provision: [
    "bundle install --path /azk/bundler",
    "bundle exec rake db:migrate",
  ],
  // ...
  mounts: {
    "/azk/#{manifest.dir}": sync("."),
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
    "/azk/#{manifest.dir}": sync("."),
    "/azk/#{manifest.dir}/node_modules": persistent("modules"),
  }
},
```

É importante observar que em ambos os casos (__rails__ e __node.js__), estamos utilizando pastas persistentes para a "guarda" as dependências instaladas do contrário as instalações seriam feitas dentro da instância temporária e seriam perdidos quando o passo de `provision` finalizasse.
