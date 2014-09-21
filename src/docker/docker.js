import { Q, pp, config, path, _, log } from 'azk';
import Utils from 'azk/utils';
import { parseRepositoryTag } from 'dockerode/lib/util';

var uuid = require('node-uuid');

// Composer
import { pull } from 'azk/docker/pull';
import { run  } from 'azk/docker/run';

export class Image extends Utils.qify('dockerode/lib/image') {
  static parseRepositoryTag(...args) {
    return parseRepositoryTag(...args);
  }
}

export class Container extends Utils.qify('dockerode/lib/container') {
  get Id() {
    return this.id;
  }

  inspect(...args) {
    return super(...args).then((data) => {
      data.Annotations = Container.unserializeAnnotations(data.Name);
      data.NetworkSettings = Container.parsePortsFromNetwork(data.NetworkSettings);
      return data;
    });
  }

  static parsePorts(ports) {
    return _.reduce(ports, (ports, port) => {
      ports[port.PrivatePort] = {
        name: port.PrivatePort,
        protocol: port.Type,
        gateway: port.IP,
        port: port.PublicPort,
      }
      return ports;
    }, {});
  }

  static parsePortsFromNetwork(network) {
    network.Access = {};
    _.each(network.Ports, (port, name) => {
      name = name.match(/(\d*)\/(.*)/);
      if (port) {
        network.Access[name[1]] = {
          name    : name[1],
          protocol: name[2],
          gateway : network.Gateway,
          port    : port[0].HostPort,
        };
      }
    });
    return network;
  }

  static parseStatus(status) {
    var state = {
      ExitCode: 0,
      Paused:  (status.match(/^Up.*\(Paused\)$/)) ? true : false,
      Running: (status.match(/^Up/)) ? true : false
    }

    // Exited? Get return code
    if (status.match(/Exited/)) {
      state.ExitCode = parseInt(
        status.replace(/Exited \((.*)\).*/, "$1")
      );
    }

    return state;
  }

  // Serialize annotations to a container name format
  static serializeAnnotations(annotations = { azk: {} }) {
    var azk = annotations.azk;

    // Unique id generator
    if (!azk.uid) {
      azk.uid = uuid.v1().replace(/-/g, "").slice(0, 10);
    }

    // Mount string
    return [config('docker:namespace'), ...(_.map(azk, (value, key) => {
      return key + "." + value;
    }))].join("_");
  }

  // Unserialize annotations from a container name
  static unserializeAnnotations(name) {
    name = name.replace(/\/(.*)/, "$1");
    var data = name.split('_');
    return _.reduce(data, (annotations, values) => {
      var key_value = values.split(".");
      annotations.azk[key_value[0]] = key_value[1];
      return annotations;
    }, { azk: {} });
  }

  static envsFromAnnotations(annotations = { azk: {}}) {
    return _.reduce(annotations.azk, (envs, value, key) => {
      if (key == 'azk') key = "env";
      envs[`AZK_${key.toUpperCase()}`] = value;
      return envs;
    }, {});
  }
}

export class Docker extends Utils.qify('dockerode') {
  constructor(opts) {
    log.info("Connect %s:%s", opts.host, opts.port);
    super(opts);

    this.c_regex = RegExp(`\/${Utils.escapeRegExp(config('docker:namespace'))}`);
  }

  getImage(name) {
    return new Image(this.modem, name);
  }

  getContainer(id) {
    return new Container(this.modem, id);
  }

  __findObj(obj) {
    return obj.inspect().then(
      (_data) => { return obj; },
      (err  ) => {
        if (err.statusCode == 404)
          return null;
        throw err;
      }
    );
  }

  azkListContainers(...args) {
    return this.listContainers(...args).then((containers) => {
      return _.reduce(containers, (result, container) => {
        if (container.Names[0].match(this.c_regex)) {
          container.Name = container.Names[0];
          container.Annotations = Container.unserializeAnnotations(container.Name);
          container.State = Container.parseStatus(container.Status);
          container.NetworkSettings = { Access: Container.parsePorts(container.Ports) };
          result.push(container);
        }
        return result;
      }, []);
    });
  }

  findImage(name) {
    return this.__findObj(this.getImage(name));
  }

  findContainer(id) {
    return this.__findObj(this.getContainer(id));
  }

  pull(...args) {
    return pull(this, ...args);
  }

  run(...args) {
    return run(this, Container, ...args);
  }
}
