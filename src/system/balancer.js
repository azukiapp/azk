import { async, config } from 'azk';
import { Balancer } from 'azk/agent/balancer';

var SystemBalancer = {
  clear(system) {
    return async(this, function*() {
      if (system.balanceable) {
        return Balancer.removeAll(system.hostname);
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
      return Balancer.getBackends(system.hostname);
    } else {
      return Q([]);
    }
  },

  _addOrRemove(system, container, method) {
    return async(this, function* () {
      if (system.balanceable) {
        container   = yield container.inspect();
        var backend = this._formatBackend(system, container);
        return Balancer[method](system.hosts, backend);
      }

      return null;
    });
  },

  _formatBackend(system, container) {
    var port = container.NetworkSettings.Access[system.http_port];
    return `http://${config('agent:vm:ip')}:${port.port}`;
  },
}

export { SystemBalancer }
export { SystemBalancer as Balancer }
