import { config, Q, defer } from 'azk';
import { app } from 'azk/agent/app';

var Server = {
  server: null,

  start() {
    return defer((done) => {
      this.server = app.listen(config('paths:agent_socket'));
    });
  },

  stop() {
    if (this.server) {
      return Q.ninvoke(this.server, "close");
    } else {
      return Q.reject("Server not running");
    }
  }
}

export { Server };
