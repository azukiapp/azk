import Azk from 'azk';
import { _, config, async } from 'azk';
import { meta as azkMeta } from 'azk';
import { calculateHash } from 'azk/utils';

var os = require('os');
var osName = require('os-name');
var InsightKeenIo = require('insight-keen-io');

export class Tracker {

  constructor(opts, ids_keys) {
    opts = _.merge({}, {
      projectId: config('tracker:projectId'),
      writeKey : config('tracker:writeKey'),
      use_fork : true,
    }, opts);

    this.ids_keys = ids_keys;
    this.insight  = new InsightKeenIo(opts);
    this.loadMetadata();
  }

  loadMetadata() {
    var cpu_obj   = os.cpus();
    var cpu_info  = cpu_obj[0].model;
    var cpu_count = cpu_obj.length;
    var arch_type = os.arch();
    var totalmem  = Math.floor(os.totalmem() / 1024 / 1024);
    var os_name   = osName();

    this._data = {
      // keen addons
      "keen" : {
        "addons" : [{
          "name" : "keen:ip_to_geo",
          "input" : {
            "ip" : "meta.ip_address"
          },
          "output" : "meta.ip_geo_info"
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
        'timestamp': (new Date()).toISOString(),
      },
      "meta": {
        "ip_address"      : "${keen.ip}",
        "agent_session_id": this.loadAgentSessionId(),
        "command_id"      : this.generateRandomId('command_id'),
        "user_id"         : this.loadTrackerUserId(),
        "azk_version"     : Azk.version,

        // device config
        "device_info": {
          "os"          : os_name,
          "proc_arch"   : arch_type,
          "total_memory": totalmem,
          "cpu_info"    : cpu_info,
          "cpu_count"   : cpu_count
        }
      }
    };
  }

  track(subject, data_to_add = null) {
    return async(this, function* () {

      // mergin meta info inside incoming event data
      if (data_to_add) {
        this.addData(data_to_add);
      }

      this.logAnalyticsData({
        eventCollection: subject,
        data: this._data
      });

      // track data with insight
      var tracking_result = yield this.insight.track(subject, this._data);

      if (tracking_result !== 0) {
        this.logAnalyticsError({stack:'[Tracker => Keen.io - failed:] ' + tracking_result.toString()});
        this.logAnalyticsData({
          eventCollection: subject,
          data: this._data
        });
      }

      return tracking_result;
    });
  }

  addData(data) {
    this._data = _.merge({}, this._data, data);
  }

  get data() {
    return this._data;
  }

  get meta_info() {
    return this._data.meta;
  }

  set meta_info(value) {
    this._data.meta = _.merge({}, this._data.meta, value);
  }

  generateRandomId(label) {
    return label + ':' + calculateHash(String(Math.floor(Date.now() * Math.random()))).slice(0, 8);
  }

  generateNewAgentSessionId() {
    var id = this.generateRandomId(this.ids_keys.agent_id);
    azkMeta.set(this.ids_keys.agent_id, id);
    this._data.meta.agent_session_id = id;
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
    return azkMeta.get(this.ids_keys.permission);
  }

  checkTrackingPermission() {
    return this.loadTrackerPermission();
  }

  // use with CLI
  askPermissionToTrack(cli) {
    var Helpers = require('azk/cli/command').Helpers;
    return Helpers.askPermissionToTrack(cli);
  }

  logAnalyticsError(err) {
    if (process.env.ANALYTICS_ERRORS === '1') {
      console.log('\n>>---------\n\n [Analytics:tracking:error]\n\n');
      if (err.stack) {
        console.log(err.stack);
      } else {
        console.log(err);
      }
    }
  }

  logAnalyticsData(analytics_data) {
    if (process.env.ANALYTICS_DATA === '1') {
      console.log('\n>>---------\n\n [Analytics:tracking:data]\n\n', require('util').inspect(analytics_data,
      { showHidden: false, depth: null, colors: true }), '\n>>---------\n');
    } else if (process.env.ANALYTICS_DATA === '2') {
      console.log('[Analytics:tracking] >', analytics_data.eventCollection, analytics_data.data.event_type);
    } else if (process.env.ANALYTICS_DATA === '3') {
      console.log('[track] >', analytics_data.eventCollection, ':', analytics_data.data.event_type);
      console.log('        >', analytics_data.data.meta.agent_session_id);
      console.log('        >', analytics_data.data.meta.command_id);
      console.log('        >', analytics_data.data.meta.user_id);
      console.log('');
    }
  }
}

// Default tracker
var default_tracker = new Tracker({}, {
  permission: 'tracker_permission',
  user_id   : 'tracker_user_id',
  agent_id  : 'agent_session_id',
});

export default default_tracker;
