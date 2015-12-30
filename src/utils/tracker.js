/* @flow */

import Azk from 'azk';
import { _, config, log, t, lazy_require } from 'azk';
import { meta as azkMeta } from 'azk';
import { defer, TimeoutError, promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  os           : 'os',
  osName       : 'os-name',
  uuid         : 'node-uuid',
  InsightKeenIo: 'insight-keen-io',
  InsightKeenIoWithMeta: () => {
    class InsightKeenIoWithMeta extends lazy.InsightKeenIo {
      constructor(opts) {
        super(opts);
      }
    }
    return InsightKeenIoWithMeta;
  }
});

export class TrackerEvent {
  constructor(collection, tracker) {
    this.collection = collection;
    this.tracker    = tracker;
    this._data      = {
      "keen": {
        "addons" : [{
          "name" : "keen:ip_to_geo",
          "input": {
            "ip" : "meta.ip_address"
          },
          "output": "meta.ip_geo_info"
        }],

        // Two time-related properties are included in your
        //  event automatically. The properties “keen.timestamp”
        //  and “keen.created_at” are set at the time your event
        //  is recorded. You have the ability to overwrite the
        //  keen.timestamp property. This could be useful, for example,
        //  if you are backfilling historical data.
        //  Be sure to use ISO-8601 Format.
        //
        //  - keen.io/docs/event-data-modeling/event-data-intro/#id9
        //
        // > (new Date(2011, 10, 11, 9, 11, 11, 111)).toISOString()
        //    '2011-11-11T11:11:11.111Z'
        "timestamp": (new Date()).toISOString(),
      },
      "meta": {}
    };
  }

  final_data() {
    return _.merge({}, this._data, {
      "meta": _.clone(this.tracker.meta)
    });
  }

  addData(data) {
    this._data = _.merge({}, this._data, data);
  }

  send(extra_func = null) {
    if (!this.tracker.loadTrackerPermission()) { return promiseResolve(false); }

    if (_.isFunction(extra_func)) {
      extra_func(this);
    }

    let event_id   = this.tracker.generateRandomId('event_id');
    var final_data = this.final_data();
    this.tracker.logAnalyticsData(event_id, this.collection, final_data);

    // track data with insight
    return this._track(this.collection, final_data)
      .timeout(10000)
      .then((tracking_result) => {
        if (tracking_result !== 0) {
          throw new Error(tracking_result.toString());
        }
        var background = this.tracker.insight.send_in_background;
        log.info('[tracker] event sendend (%s) (send_in_background: %s)', event_id, background);
        return tracking_result;
      })
      .catch(TimeoutError, () => {
        log.warn('[tracker] timeout (%s): %s', event_id, t("tracking.timeout"));
        return false;
      })
      .catch((err) => {
        log.warn('[tracker] error (%s) %s', event_id, err.stack, {});
        return false;
      });
  }

  // Best practice: not connect external promise in your promise system
  _track(collection, final_data) {
    return defer((resolve, reject) => {
      this.tracker.insight
        .track(collection, final_data)
        .then(resolve, reject);
    });
  }
}

export class Tracker {

  constructor(opts, ids_keys) {
    opts = _.merge({}, {
      projectId          : config('tracker:projectId'),
      writeKey           : config('tracker:writeKey'),
      send_in_background : config('tracker:send_in_background')
    }, opts);

    this.ids_keys      = ids_keys;
    this.insight_opts  = opts;
    this.meta          = {
      "ip_address"      : "${keen.ip}",
      "agent_session_id": this.loadAgentSessionId(),
      "command_id"      : this.generateRandomId('command_id'),
      "user_id"         : this.loadTrackerUserId(),
      "azk_version"     : Azk.version,

      // device config
      "device_info": {
        "os"          : lazy.osName(),
        "proc_arch"   : lazy.os.arch(),
        "total_memory": Math.floor(lazy.os.totalmem() / 1024 / 1024),
        "cpu_info"    : lazy.os.cpus()[0].model,
        "cpu_count"   : lazy.os.cpus().length
      }
    };

    log.debug(`[tracker] permission to tracker: ${this.loadTrackerPermission()}`);
  }

  get insight() {
    if (!this.__insight) {
      this.__insight = new lazy.InsightKeenIoWithMeta(this.insight_opts);
    }
    return this.__insight;
  }

  newEvent(collection, data = {}) {
    var event = new TrackerEvent(collection, this);
    event.addData(data);
    return event;
  }

  sendEvent(collection, data = {}) {
    var extra_func = null;
    if (_.isFunction(data)) {
      extra_func = data;
      data = {};
    }
    return this.newEvent(collection, data).send(extra_func);
  }

  generateRandomId(label) {
    return label + ':' + lazy.uuid.v1().replace(/-/g, "").slice(0, 15);
  }

  generateNewAgentSessionId() {
    var id = this.generateRandomId(this.ids_keys.agent_id);
    azkMeta.set(this.ids_keys.agent_id, id);
    this.meta.agent_session_id = id;
    return id;
  }

  loadAgentSessionId() {
    return azkMeta.get(this.ids_keys.agent_id);
  }

  loadTrackerUserId() {
    return azkMeta.getOrSet(this.ids_keys.user_id, this.generateRandomId(this.ids_keys.user_id));
  }

  saveTrackerPermission(answer) {
    return azkMeta.set(this.ids_keys.permission, answer);
  }

  loadTrackerPermission() {
    // opt-out: by default can track when terms of use are accepted
    return (config('tracker:disable')) ? false : azkMeta.get(this.ids_keys.permission, true);
  }

  logAnalyticsError(err) {
    log.warn('[tracker] ', err.stack || err.toString());
  }

  logAnalyticsData(event_id, collection, data) {
    log.info('[tracker] sending (%s): %j', event_id, {
      collection: collection,
      event_type: data.event_type,
      meta: {
        agent_session_id: data.meta.agent_session_id,
        command_id: data.meta.command_id,
        user_id: data.meta.user_id,
      }
    }, {});
  }
}

// Default tracker
var default_tracker = new Tracker({
  send_in_background: true,
}, {
  permission: 'tracker_permission',
  user_id   : 'tracker_user_id',
  agent_id  : 'agent_session_id',
});

export default default_tracker;
