import { async, defer, log, publish } from 'azk';

var Tools = {
  change_status(key, notify, status, data) {
    var keys = ["commands", key, "status", status];
    (status != "error") ?  log.info_t(keys, data) : null;
    publish("agent." + key + ".status", { type: "status", context: key, status: status, data: data });
  },

  defer_status(key, func) {
    return defer((resolve, reject, notify) => {
      return func(resolve, reject, (status, data) => {
        this.change_status(key, notify, status, data);
      });
    });
  },

  async_status(key, ...args) {
    return defer((_resolve, _reject, notify) => {
      var args_to_call = [...args];
      args_to_call.push((status, data) => {
        this.change_status(key, notify, status, data);
      });
      return async(...args_to_call);
    });
  },
};

export { Tools };
