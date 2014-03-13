var http   = require('http');
var h      = require('../spec_helper.js');
var proxy  = require('../../lib/agent/proxy');
var q_http = require("q-io/http");

var azk  = h.azk;
var Q    = azk.Q;
var _    = azk._;
var port = 8124;

function request(host) {
  return h.request('127.0.0.1', port + 1, host);
}

describe("Azk agent proxy", function() {
  var server, proxy_server;
  var events = [];

  before(function() {
    server = http.createServer(function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('foo bar\n');
    });
    server.listen(port, "127.0.0.1");
    proxy.start(port + 1, function() {
      events.push(_.toArray(arguments));
    });
  });

  beforeEach(function() {
    proxy.reset();
    events = [];
  });

  it("should register a backend", function() {
    var backend = "127.0.0.1:" + port;
    proxy.register("example.com", backend);
    h.expect(proxy.get("example.com")).to.equal(backend);
  });

  it("should return list of backends", function() {
    proxy.register("example.com", "http://127.0.0.1");
    proxy.register("example.com", "http://127.0.0.2");

    h.expect(proxy.list("example.com")).to.eql(["http://127.0.0.1", "http://127.0.0.2"]);
  });

  it("should remove a backend", function() {
    var backend = "127.0.0.1:" + port;
    var domain  = "example.com";

    proxy.register(domain, backend);
    h.expect(proxy.get(domain)).to.equal(backend);

    proxy.remove(domain, backend);
    h.expect(proxy.get(domain)).to.be.null;
  });

  it("should proxy request", function() {
    var backend = "http://127.0.0.1:" + port;
    var domain  = "example.com";
    proxy.register(domain, backend);

    return request(domain).spread(function(code, body) {
      var event = ['proxy.request', 'example.com', backend];
      h.expect(code).to.equal(200);
      h.expect(body).to.match(/foo bar/);
      h.expect(events).to.include.something.deep.equal(event);
    });
  });

  it("should return 404 if not have a backend", function() {
    return request("example.com").spread(function(code, body) {
      var event = ['proxy.not_configured', 'example.com'];
      h.expect(code).to.equal(400);
      h.expect(body).to.match(/No Application Configured/);
      h.expect(events).to.include.something.deep.equal(event);
    });
  });
});
