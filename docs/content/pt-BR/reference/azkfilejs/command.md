## command

Comando que será executado sempre o que o sistema for levantado. Se não for informado, o comando padrão ([CMD](https://docs.docker.com/reference/builder/#cmd)) da imagem será executado.

#### Uso:

```js
command: 'COMMAND_GOES_HERE',
```

##### Exemplos:

Numa aplicação em __node.js__ seria interessante rodar o `npm start` para iniciar o servidor web.

```js
command: 'npm start',
```

Por sua vez, em __rails__, iniciamos com o `rackup config.ru`.

```js
command: 'bundle exec rackup config.ru --port $HTTP_PORT',
```

