import { lazy_require } from 'azk';
import postal from 'postal';

let lazy = lazy_require({
  colors: ['azk/utils/colors']
});

export class ChannelPub {
  constructor(channel_name = "azk") {
    this.channel = postal.channel(channel_name);
  }

  get name() {
    return this.channel.channel;
  }

  error(msg, args) {
    throw new Error(msg, 'arguments:', args);
  }

  subscribe(topicName, callback) {
    if (!topicName || !callback) {
      this.error('you must suply a topicName and a callback function.', arguments);
    }
    return this.channel.subscribe(topicName, callback);
  }

  subscriptions() {
    return postal.getSubscribersFor({ channel: this.name });
  }

  unsubscribeAll() {
    return postal.unsubscribeFor({ channel: this.name });
  }

  publish(topicName, obj_to_publish) {
    if (!topicName || !obj_to_publish) {
      this.error('you must suply a topicName and a obj_to_publish.', arguments);
    }
    return this.channel.publish(topicName, obj_to_publish);
  }
}

export class IPublisher {
  constructor(topic_prefix) {
    this.topic_prefix = topic_prefix;
  }

  publish(topic, ...args) {
    azk_channel.publish(this.topic_prefix + '.' + topic, ...args);
  }

  subscribe(topic, func = null) {
    if (typeof topic === 'function') {
      [func, topic] = [topic, null];
    }
    topic = topic || "*";
    return azk_channel.subscribe(`${this.topic_prefix}.${topic}`, func);
  }
}

export class SubscriptionLogger {
  constructor() {
    this.date_now = Date.now();
    this.loggerSubscription = null;
  }

  subscribeTo(topic) {
    if (topic) {
      var subscribe_topic = topic;
      var subscribe = azk_channel.subscribe.bind(azk_channel);
      var log = require("azk/utils/log").log;

      if (!this.date_now) {
        this.date_now = Date.now();
      }

      // unsubscribe if already subscribed
      if (this.loggerSubscription) {
        this.unsubscribeLogger();
      }

      this.loggerSubscription = subscribe(subscribe_topic, function (data, envelope) {
        try {
          var final_string = '';

          //  timespan
          var timespan = Date.now() - this.date_now;
          this.date_now = Date.now();
          var timespan_string = timespan.toString();
          var spaces_to_add = 6 - timespan_string.length;
          var spaces_to_add_string = '';
          for (var i = 0; i < spaces_to_add; i++) {
            spaces_to_add_string = spaces_to_add_string + ' ';
          }
          final_string += lazy.colors.gray('[postal]') +
            spaces_to_add_string +
            timespan_string.gray +
            lazy.colors.gray('.ms');

          // # topic
          final_string += lazy.colors.gray(' # ');
          final_string += lazy.colors.white.italic(envelope.topic);

          // context
          if (data.context) {
            final_string += lazy.colors.blue(' :') + lazy.colors.blue(data.context);
          }

          // type
          if (data.type) {
            final_string += lazy.colors.magenta(' :') + lazy.colors.magenta(data.type);
          }

          // statusParsed or status
          if (typeof data.statusParsed === 'string') {
            final_string += lazy.colors.green(' :') + lazy.colors.green(data.statusParsed);
          } else if (data.statusParsed && data.statusParsed.type) {
            final_string += lazy.colors.green(' :') + lazy.colors.green(data.statusParsed.type.toString());
          } else if (data.status) {
            final_string += lazy.colors.green(' :') + lazy.colors.green(data.status);
          }

          // id
          if (data.id) {
            var id = data.id.toString();
            if (id.length > 8) {
              id = id.substring(0, 8);
            }
            final_string += lazy.colors.cyan(' #') + lazy.colors.cyan(id);
          }

          // data content substring
          var length = 10;
          var mydata_prefix = lazy.colors.gray(' data: ');
          var mydata = null;
          if (data.stream) {
            mydata_prefix = lazy.colors.gray(' stream: ');
            mydata = data.stream.toString();
          } else if (data.progressDetail) {
            mydata_prefix = lazy.colors.gray(' progressDetail: ');
            mydata = JSON.stringify(data.progressDetail);
          } else if (typeof data === 'string') {
            mydata = data;
          }

          if (mydata) {
            mydata = mydata.replace(/\n/gm, ''); // remove new lines
            if (mydata.length >= length) {
              length = mydata.length;
            }
            final_string += mydata_prefix + mydata.substring(0, length).gray;
          }

          log.debug(final_string);
        } catch (err) {
          log.error(err.stack);
          // log.debug({ log_label: "[postal]", data: err});
        }
      }.bind(this));
    }
  }

  unsubscribeLogger() {
    if (this.loggerSubscription) {
      this.loggerSubscription.unsubscribe();
    }
  }
}

// Expose default methods
var azk_channel = new ChannelPub();
var methods = ["subscribe", "publish", "subscriptions", "unsubscribeAll"];
methods.forEach(function(m) {
  exports[m] = azk_channel[m].bind(azk_channel);
});

// Expose default channel
export { azk_channel as channel };
