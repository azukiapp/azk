import { _ } from 'azk';
import { originalDefer } from 'azk/utils/promises';
import { subscribe } from 'azk/utils/postal';

export function extend(h) {
  h.wait_subscription = function(topic, filter = null, block = null) {
    var deferred = originalDefer();
    var sub = null, msgs = [];
    try {
      sub = subscribe(topic, (msg) => {
        msgs.push(msg);
        if (!_.isFunction(filter) || filter(msg, msgs)) {
          sub.unsubscribe();
          deferred.resolve(msgs);
        }
      });
      if (_.isFunction(block)) {
        setImmediate(block);
      }
    } catch (err) {
      deferred.reject(err);
    }

    return [deferred.promise, sub];
  };

  h.wait_msgs = function(...args) {
    var [wait] = h.wait_subscription(...args);
    return wait;
  };

  h.wait_msg = function(...args) {
    return h.wait_msgs(...args).spread((msg) => {
      return msg;
    });
  };
}
