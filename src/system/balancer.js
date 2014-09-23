import { async, config } from 'azk';

var SystemBalancer = {
  get balancer() {
    return require('azk/agent/balancer').Balancer;
  },

  clear(system) {
    return async(this, function*() {
      if (system.balanceable) {
        return this.balancer.removeAll(system.hostname);
      }
      return false;
    });
  },

  add(system, container) {
    return this._addOrRemove(system, container, 'addBackend');
  },

  remove(system, container) {
    return this._addOrRemove(system, container, 'removeBackend');
  },

  list(system) {
    if (system.balanceable) {
      return this.balancer.getBackends(system.hostname);
    } else {
      return Q([]);
    }
  },

  _addOrRemove(system, container, method) {
    return async(this, function* () {
      if (system.balanceable) {
        var data = yield container.inspect();
        if (data.State.Running) {
          var backend = this._formatBackend(system, data);
          if (backend) {
            return this.balancer[method](system.hosts, backend);
          }
        }
      }

      return null;
    });
  },

  _formatBackend(system, container) {
    var port = container.NetworkSettings.Access[system.http_port] || {};
    if (port.port) {
      return `http://${config('agent:vm:ip')}:${port.port}`;
    }
  },
}

export { SystemBalancer }
export { SystemBalancer as Balancer }
