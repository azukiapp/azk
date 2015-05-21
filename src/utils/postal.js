var postal = require('postal');
var AZK_DEFAULT_CHANNEL = 'azk';

function error(msg, args) {
  throw new Error(msg, 'arguments:', args);
}

export function channel(name = AZK_DEFAULT_CHANNEL) {
  return postal.channel(name);
}

export function subscribe(topicName, callback) {
  if (!topicName || !callback) {
    error('you must suply a topicName and a callback function.', arguments);
  }
  return channel().subscribe(topicName, callback);
}

export function publish(topicName, obj_to_publish) {
  if (!topicName || !obj_to_publish) {
    error('you must suply a topicName and a obj_to_publish.', arguments);
  }
  return channel().publish(topicName, obj_to_publish);
}

export class IPublisher {
  constructor(topic_prefix) {
    this.topic_prefix = topic_prefix;
  }

  publish(topic, ...args) {
    publish(this.topic_prefix + '.' + topic, ...args);
  }
}
