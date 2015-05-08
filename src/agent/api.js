import { _, Q, defer, async, config } from 'azk';
import { Rsync } from 'azk/agent/rsync';

// Express load and init
var qfs        = require('q-io/fs');
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

require('express-ws')(app);

app.use(bodyParser.urlencoded({ extended: false }));

// Module
var Api = {
  server: null,

  wss: null,

  mount() {
    // Return configs from set by Configure
    app.get('/configs', (req, res) => {
      var keys = config('agent:config_keys');
      res.json(_.reduce(keys, (acc, key) => {
        acc[key] = config(key);
        return acc;
      }, {}));
    });
  },

  sync() {
    // Start watching a folder to sync between host and guest
    app.post('/syncs', (req, res) => {
      var [host_folder, guest_folder] = [req.body.host_folder, req.body.guest_folder];
      Rsync.sync_folders(host_folder, guest_folder)
      .then(() => {
        console.log("folders sync'ed!");
        res.sendStatus(201);
      })
      .fail((err) => {
        console.log("folders sync fail", err);
        res.sendStatus(500);
      });
    });
  },

  ws() {
    // Init websocket entry point
    app.ws('/sync/initial', function(ws) {
      ws.on('message', function(data) {
        var sync_data = JSON.parse(data);
        var [host_folder, guest_folder] = [sync_data.host_folder, sync_data.guest_folder];

        ws.send('start');
        console.log('outside rsync', host_folder, guest_folder);
        Rsync.sync_folders(host_folder, guest_folder)
        .then(() => {
          console.log("folders sync'ed!");
          ws.send('done');
        })
        .fail((err) => {
          console.log("folders sync fail", err);
          ws.send('fail');
        });
      });
    });
  },

  start() {
    return async(this, function* () {
      // Listen in unix domain socket
      var socket = config('paths:api_socket');
      yield this._clearSocket(socket);
      yield this._listen(socket);

      // this.server.on('upgrade', function(req, socket) {
      //   console.log('upgrade!');
      //   socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
      //                'Upgrade: WebSocket\r\n' +
      //                'Connection: Upgrade\r\n' +
      //                '\r\n');

      //   socket.pipe(socket);
      // });

      // Mount entries points
      this.mount();
      this.ws();
      this.sync();

      // this._createWebSocketServer();
    });
  },

  stop() {
    return (this.server) ? Q.ninvoke(this.server, "close") : Q();
  },

  // Remove socket if exist
  _clearSocket(socket) {
    return qfs
      .exists(socket)
      .then((exist) => {
        if (exist) {
          return qfs.remove(socket);
        }
      });
  },

  _listen(socket) {
    return defer((resolve, reject) => {
      this.server = app.listen(socket, (err) => {
        (err) ? reject(err) : resolve();
      });
    });
  },

  // _createWebSocketServer() {
  //   // this.wss = new WebSocketServer({
  //   //   httpServer: this.server,
  //   //   autoAcceptConnections: true
  //   // });

  //   this.wss = yawl.createServer({
  //     server: this.server,
  //     origin: null,
  //     allowTextMessages: true
  //   });

  //   // this.wss.on('request', function(request) {
  //   //   var connection = request.accept();
  //   //   console.log((new Date()) + ' Connection accepted.');
  //   //   connection.on('message', function(message) {
  //   //     console.log('Received Message: ' + message.utf8Data);

  //   //     var sync_data = JSON.parse(message.utf8Data);
  //   //     Rsync.sync_folders(sync_data.host_folder, sync_data.guest_folder)
  //   //     .then(() => {
  //   //       console.log("folders sync'ed!");
  //   //       connection.sendUTF('done');
  //   //     })
  //   //     .fail((err) => {
  //   //       console.log("folders sync fail", err);
  //   //       connection.sendUTF('fail');
  //   //     })
  //   //     .done(() => {
  //   //       connection.close();
  //   //     });
  //   //   });
  //   //   // connection.on('close', function(reasonCode, description) {
  //   //   connection.on('close', function() {
  //   //     console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  //   //   });
  //   // });

  //   console.log('wss', this.wss);

  //   this.wss.on('connection', function(ws) {
  //     ws.sendText('ronaldo');
  //     ws.sendText('oi');
  //     ws.sendText('querida');
  //     console.log('ws connected');
  //     ws.on('textMessage', function(message) {
  //       console.log('Received Message: ' + message.utf8Data);
  //       var sync_data = JSON.parse(message);
  //       Rsync.sync_folders(sync_data.host_folder, sync_data.guest_folder)
  //       .then(() => {
  //         console.log("folders sync'ed!");
  //         ws.sendText('done');
  //       })
  //       .fail((err) => {
  //         console.log("folders sync fail", err);
  //         ws.sendText('fail');
  //       });
  //       // .done(() => {
  //       //   connection.close();
  //       // });
  //     });
  //   });
  // }
};

export { Api };
