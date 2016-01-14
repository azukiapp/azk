## command

Command that will always run when the system starts. If not set, the default command ([CMD](https://docs.docker.com/reference/builder/#cmd)) of the image is performed.

#### Usage:

```js
command: ['COMMAND_GOES_HERE', "arg1", "arg2", ...],
// Old style (still supported but not recommended)
command: 'COMMAND_GOES_HERE',
```

##### Examples:

In a __node.js__ application it would be interesting to run `npm start` to start the web server.

```js
command: ['npm', 'start'],
```

In turn, in __rails__, we would start with `rackup config.ru`.

```js
command: ['bundle', 'exec', 'rackup', 'config.ru', '--port', '$HTTP_PORT'],
```

