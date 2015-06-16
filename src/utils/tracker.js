import Azk from 'azk';
import { _, config, log, t, lazy_require } from 'azk';
import { meta as azkMeta } from 'azk';
import { promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  os           : 'os',
  osName       : 'os-name',
  calculateHash: ['azk/utils'],
  InsightKeenIo: 'insight-keen-io',
  InsightKeenIoWithMeta: () => {
    class InsightKeenIoWithMeta extends lazy.InsightKeenIo {
      constructor(opts) {
        super(opts);
        this._opt_out_key = opts.opt_out_key;
      }

      get optOut() {
        return !azkMeta.get(this._opt_out_key);
      }

      set optOut(val) {
        azkMeta.set(this._opt_out_key, !val);
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
      "meta": this.tracker.meta
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

    var final_data = this.final_data();
    this.tracker.logAnalyticsData({
      eventCollection: this.collection,
      data: final_data
    });

    // track data with insight
    return this.tracker.insight.track(this.collection, final_data)
      .timeout(10000)
      .then((tracking_result) => {
        if (tracking_result !== 0) {
          this.tracker.logAnalyticsError({stack:'[Tracker => Keen.io - failed:] ' + tracking_result.toString()});
          this.tracker.logAnalyticsData({
            eventCollection: this.collection,
            data: final_data
          });
        }
        return tracking_result;
      }, () => {
        log.warn('[tracker] > timeout:', t("tracking.timeout"));
        return false;
      });
  }
}

export class Tracker {

  constructor(opts, ids_keys) {
    opts = _.merge({}, {
      projectId  : config('tracker:projectId'),
      writeKey   : config('tracker:writeKey'),
      use_fork   : true,
      opt_out_key: ids_keys.permission,
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
    return label + ':' + lazy.calculateHash(String(Math.floor(Date.now() * Math.random()))).slice(0, 8);
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
    var permission = (config('tracker:disable')) ? false : azkMeta.get(this.ids_keys.permission);
    log.debug(`[tracker] permission: ${permission}`);
    return permission;
  }

  checkTrackingPermission() {
    return this.loadTrackerPermission();
  }

  logAnalyticsError(err) {
    log.warn('[tracker] >', err.stack || err.toString());
  }

  logAnalyticsData(analytics_data) {
    log.info (`[tracker] ${analytics_data.eventCollection}:${analytics_data.data.event_type}`);
    log.info (`[tracker]`, analytics_data.data.meta.agent_session_id);
    log.info (`[tracker]`, analytics_data.data.meta.command_id);
    log.info (`[tracker]`, analytics_data.data.meta.user_id);
    log.debug(`[tracker] data:`, analytics_data);
  }
}

// Default tracker
var default_tracker = new Tracker({}, {
  permission: config('tracker:permission_key'),
  user_id   : 'tracker_user_id',
  agent_id  : 'agent_session_id',
});

export default default_tracker;
