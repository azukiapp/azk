import { async, defer, log } from 'azk';

var Tools = {
  change_status(key, notify, status, data) {
    var keys = ["commands", key, "status", status];
    (status != "error") ?  log.info_t(keys, data) : null;
    notify({ type: "status", context: key, status: status, data: data });
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
      args = [...args, (status, data) => {
        this.change_status(key, notify, status, data);
      }];
      return async(...args);
    });
  },
}

export { Tools }
