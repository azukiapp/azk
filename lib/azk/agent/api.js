"use strict";
var __moduleName = "src/agent/api";
var $__1 = require('azk'),
    _ = $__1._,
    Q = $__1.Q,
    defer = $__1.defer,
    async = $__1.async,
    config = $__1.config;
var qfs = require('q-io/fs');
var express = require('express');
var app = express();
var Api = {
  server: null,
  mount: function() {
    app.get('/configs', (function(req, res) {
      var keys = config('agent:config_keys');
      res.json(_.reduce(keys, (function(acc, key) {
        acc[key] = config(key);
        return acc;
      }), {}));
    }));
  },
  start: function() {
    return async(this, function() {
      var socket;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.mount();
              socket = config('paths:api_socket');
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 2;
              return this._clearSocket(socket);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return this._listen(socket);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stop: function() {
    return (this.server) ? Q.ninvoke(this.server, "close") : Q();
  },
  _clearSocket: function(socket) {
    return qfs.exists(socket).then((function(exist) {
      if (exist)
        return qfs.remove(socket);
    }));
  },
  _listen: function(socket) {
    var $__0 = this;
    return defer((function(resolve, reject) {
      $__0.server = app.listen(socket, (function(err) {
        (err) ? reject(err) : resolve();
      }));
    }));
  }
};
;
module.exports = {
  get Api() {
    return Api;
  },
  __esModule: true
};
//# sourceMappingURL=api.js.map