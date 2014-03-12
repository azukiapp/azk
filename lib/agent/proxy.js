var azk   = require('../azk');
var http  = require('http');
var path  = require('path');
var fs    = require('fs');
var httpProxy = require('http-proxy');

var _ = azk._;

var Proxy = module.exports = {};
var data  = { }

Proxy.reset = function() {
  data = {};
}

Proxy.remove = function(host, backend) {
  var entries = data[host] || [];
  data[host] = _.filter(entries, function(entry) {
    return entry != backend;
  });
}

Proxy.register = function(host, backend) {
  var entries = data[host] || [];
  if (!_.include(entries, backend)) {
    entries.push(backend);
  }
  data[host] = entries;
}

Proxy.get = function(host) {
  var entries = data[host] || [];
  return entries[Math.floor(Math.random() * entries.length)] || null;
}

Proxy.responseStatic = function(code, res) {
  var filePath = path.join(__dirname, '..', 'share', 'proxy_static', code + '.html');
  var stream = fs.createReadStream(filePath);
  var headers = {
      'content-type': 'text/html',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'expires': '-1'
  };
  //if (res.debug === true) {
      //headers['x-debug-error'] = message;
      //headers['x-debug-version-hipache'] = versions.hipache;
  //}
  res.writeHead(code, headers);
  stream.on('data', function (data) {
      res.write(data);
  });
  stream.on('error', function () {
      res.end();
  });
  stream.on('end', function () {
      res.end();
  });
}

Proxy.start = function(port, debug) {
  var proxy = httpProxy.createProxyServer({});

  var requestHandler = function(req, res) {
    var host    = req.headers.host;
    var address = Proxy.get(host);

    if (address) {
      debug("azk.proxy.request", host, address);
      proxy.web(req, res, { target: address });
    } else {
      debug("azk.proxy.not_configured", host);
      Proxy.responseStatic(400, res);
    }
  }

  port = port || azk.cst.DAEMON_PROXY_PORT;
  debug("azk.proxy.started", port);

  http.createServer(requestHandler).listen(port);
}
