"use strict";
var __moduleName = "src/docker/docker";
var $__7 = require('azk'),
    Q = $__7.Q,
    pp = $__7.pp,
    config = $__7.config,
    path = $__7.path,
    _ = $__7._,
    log = $__7.log;
var Utils = require('azk/utils').default;
var parseRepositoryTag = require('dockerode/lib/util').parseRepositoryTag;
var uuid = require('node-uuid');
var pull = require('azk/docker/pull').pull;
var run = require('azk/docker/run').run;
var Image = function Image() {
  $traceurRuntime.defaultSuperCall(this, $Image.prototype, arguments);
};
var $Image = Image;
($traceurRuntime.createClass)(Image, {}, {parseRepositoryTag: function() {
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return parseRepositoryTag.apply(null, $traceurRuntime.toObject(args));
  }}, Utils.qify('dockerode/lib/image'));
var Container = function Container() {
  $traceurRuntime.defaultSuperCall(this, $Container.prototype, arguments);
};
var $Container = Container;
($traceurRuntime.createClass)(Container, {
  get Id() {
    return this.id;
  },
  inspect: function() {
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return $traceurRuntime.superCall(this, $Container.prototype, "inspect", $traceurRuntime.spread(args)).then((function(data) {
      data.Annotations = $Container.unserializeAnnotations(data.Name);
      data.NetworkSettings = $Container.parsePortsFromNetwork(data.NetworkSettings);
      return data;
    }));
  }
}, {
  parsePorts: function(ports) {
    return _.reduce(ports, (function(ports, port) {
      ports[port.PrivatePort] = {
        name: port.PrivatePort,
        protocol: port.Type,
        gateway: port.IP,
        port: port.PublicPort
      };
      return ports;
    }), {});
  },
  parsePortsFromNetwork: function(network) {
    network.Access = {};
    _.each(network.Ports, (function(port, name) {
      name = name.match(/(\d*)\/(.*)/);
      if (port) {
        network.Access[name[1]] = {
          name: name[1],
          protocol: name[2],
          gateway: network.Gateway,
          port: port[0].HostPort
        };
      }
    }));
    return network;
  },
  parseStatus: function(status) {
    var state = {
      ExitCode: 0,
      Paused: (status.match(/^Up.*\(Paused\)$/)) ? true : false,
      Running: (status.match(/^Up/)) ? true : false
    };
    if (status.match(/Exited/)) {
      state.ExitCode = parseInt(status.replace(/Exited \((.*)\).*/, "$1"));
    }
    return state;
  },
  serializeAnnotations: function() {
    var annotations = arguments[0] !== (void 0) ? arguments[0] : {azk: {}};
    var azk = annotations.azk;
    if (!azk.uid) {
      azk.uid = uuid.v1().replace(/-/g, "").slice(0, 10);
    }
    return $traceurRuntime.spread([config('docker:namespace')], (_.map(azk, (function(value, key) {
      return key + "." + value;
    })))).join("_");
  },
  unserializeAnnotations: function(name) {
    name = name.replace(/\/(.*)/, "$1");
    var data = name.split('_');
    return _.reduce(data, (function(annotations, values) {
      var key_value = values.split(".");
      annotations.azk[key_value[0]] = key_value[1];
      return annotations;
    }), {azk: {}});
  },
  envsFromAnnotations: function() {
    var annotations = arguments[0] !== (void 0) ? arguments[0] : {azk: {}};
    return _.reduce(annotations.azk, (function(envs, value, key) {
      if (key == 'azk')
        key = "env";
      envs[("AZK_" + key.toUpperCase())] = value;
      return envs;
    }), {});
  }
}, Utils.qify('dockerode/lib/container'));
var Docker = function Docker(opts) {
  log.info("Connect %s:%s", opts.host, opts.port);
  $traceurRuntime.superCall(this, $Docker.prototype, "constructor", [opts]);
  this.c_regex = RegExp(("\/" + Utils.escapeRegExp(config('docker:namespace'))));
};
var $Docker = Docker;
($traceurRuntime.createClass)(Docker, {
  getImage: function(name) {
    return new Image(this.modem, name);
  },
  getContainer: function(id) {
    return new Container(this.modem, id);
  },
  __findObj: function(obj) {
    return obj.inspect().then((function(_data) {
      return obj;
    }), (function(err) {
      if (err.statusCode == 404)
        return null;
      throw err;
    }));
  },
  azkListContainers: function() {
    var $__8;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    var $__0 = this;
    return ($__8 = this).listContainers.apply($__8, $traceurRuntime.toObject(args)).then((function(containers) {
      return _.reduce(containers, (function(result, container) {
        if (container.Names[0].match($__0.c_regex)) {
          container.Name = container.Names[0];
          container.Annotations = Container.unserializeAnnotations(container.Name);
          container.State = Container.parseStatus(container.Status);
          container.NetworkSettings = {Access: Container.parsePorts(container.Ports)};
          result.push(container);
        }
        return result;
      }), []);
    }));
  },
  findImage: function(name) {
    return this.__findObj(this.getImage(name));
  },
  findContainer: function(id) {
    return this.__findObj(this.getContainer(id));
  },
  pull: function() {
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    return pull.apply(null, $traceurRuntime.spread([this], args));
  },
  run: function() {
    for (var args = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      args[$__6] = arguments[$__6];
    return run.apply(null, $traceurRuntime.spread([this, Container], args));
  }
}, {}, Utils.qify('dockerode'));
module.exports = {
  get Image() {
    return Image;
  },
  get Container() {
    return Container;
  },
  get Docker() {
    return Docker;
  },
  __esModule: true
};
//# sourceMappingURL=docker.js.map