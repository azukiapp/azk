import { async, defer, log, publish } from 'azk';

var Tools = {
  change_status(key, status, data) {
    var keys = ["commands", key, "status", status];
    (status != "error") ?  log.info_t(keys, data) : null;
    publish("agent." + key + ".status", { type: "status", context: key, status: status, data: data });
  },

  defer_status(key, func) {
    return defer((resolve, reject) => {
      return func(resolve, reject, (status, data) => {
        this.change_status(key, status, data);
      });
    });
  },

  async_status(key, ...args) {
    args.push((status, data) => {
      this.change_status(key, status, data);
    });
    return async(...args);
  },
};

export { Tools };
