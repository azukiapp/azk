import { config, Q, defer } from 'azk';

var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('Hello World');
});

var Server = {
  server: null,

  start() {
    return defer((done) => {
      this.server = app.listen(config('paths:agent_socket'));
    });
  },

  stop() {
    if (this.server) {
      return Q.ninvoke(this.server, "close");
    } else {
      return Q.reject("Server not running");
    }
  }
}

export { Server };
