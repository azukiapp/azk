import { _, Q } from 'azk';
import { subscribe } from 'azk/utils/postal';

export function extend(h) {
  h.wait_subscription = function(topic, filter = null, block = null) {
    var deferred = Q.defer();
    var sub = null, msgs = [];
    try {
      sub = subscribe(topic, (msg) => {
        msgs.push(msg);
        if (!_.isFunction(filter) || filter(msg, msgs)) {
          sub.unsubscribe();
          deferred.resolve(msgs);
        }
      });
      if (!_.isEmpty(block)) { block(); }
    } catch (err) {
      deferred.reject(err);
    }

    return [deferred.promise, sub];
  };
}
