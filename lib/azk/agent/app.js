"use strict";
var __moduleName = "src/agent/app";
var $__0 = require('azk'),
    config = $__0.config,
    Q = $__0.Q,
    defer = $__0.defer;
var express = require('express');
var app = express();
app.get('/', (function(req, res) {
  res.send('hello world');
}));
;
module.exports = {
  get app() {
    return app;
  },
  __esModule: true
};
//# sourceMappingURL=app.js.map