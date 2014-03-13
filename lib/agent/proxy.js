var azk   = require('../azk');
var http  = require('http');
var path  = require('path');
var fs    = require('fs');
var httpProxy = require('http-proxy');

var _ = azk._;
var debug = azk.debug("azk:proxy");

var Proxy = module.exports = {};
var data  = { }

Proxy.reset = function() {
  data = {};
}

Proxy.clear = function(hosts) {
  _.each(_.isString(hosts) ? [hosts] : hosts, function(host) {
    data[host] = [];
  });
}

Proxy.remove = function(hosts, backend) {
  _.each(_.isString(hosts) ? [hosts] : hosts, function(host) {
    var entries = data[host] || [];
    data[host] = _.filter(entries, function(entry) {
      return entry != backend;
    });
  });
}

Proxy.register = function(hosts, backend) {
  _.each(_.isString(hosts) ? [hosts] : hosts, function(host) {
    var entries = data[host] || [];
    if (!_.include(entries, backend)) {
      debug("register: %s => %s", host, backend);
      entries.push(backend);
    }
    data[host] = entries;
  });
}

Proxy.get = function(host) {
  var entries = data[host] || [];
  return entries[Math.floor(Math.random() * entries.length)] || null;
}

Proxy.list = function(host) {
  return data[host];
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

    proxy.on('error', function(err) {
      azk.fail(err.stack);
    });

    if (address) {
      debug("azk.proxy.request", host, address);
      try {
        proxy.web(req, res, { target: address });
      } catch (e) {
        Proxy.responseStatic(400, res);
      }
    } else {
      debug("azk.proxy.not_configured", host);
      Proxy.responseStatic(400, res);
    }
  }

  port = port || azk.cst.DAEMON_PROXY_PORT;
  debug("azk.proxy.started", port);

  http.createServer(requestHandler).listen(port);
}
