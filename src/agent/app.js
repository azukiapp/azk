import { config, Q, defer } from 'azk';

var express = require('express');
var app = express();

app.get('/', (req, res) => {
  res.send('hello world');
});

export { app };
