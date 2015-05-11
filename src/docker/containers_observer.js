import { _, lazy_require, log } from 'azk';
import { defer, promiseResolve } from 'azk/utils/promises';
import { IPublisher } from 'azk/utils/postal';

var l = lazy_require({
  docker : ['azk/docker', 'default'],
  JStream: 'jstream',
});

// create, destroy, die, exec_create, exec_start, export, kill, oom, pause, restart, start, stop, unpause

export class ContainersObserver extends IPublisher  {
  constructor(filters = null) {
    super("containers.observer");
    this.stream    = null;
    this.stoping   = null;
    this.starting  = false;
    this.attemps   = 0;
    this.filters   = filters;
  }

  get stream() {
    return this.__stream;
  }

  set stream(value) {
    this.__stream = value;
    // Connect operations in stream
    if (value) {
      l.docker.modem.followProgress(
        value,
        this._stream_end.bind(this),
        this._handler.bind(this)
      );
    }
  }

  start() {
    if (this.starting || this.stoping) { return promiseResolve(); }
    this.starting = true;
    this.attemps++;

    var options = {};
    if (!_.isEmpty(this.filters)) {
      options.filters = JSON.stringify(this.filters);
    }

    log.debug('[docker] starting containers observer');
    return defer((resolve, reject) => {
      l.docker.getEvents(options)
        .then((stream) => {
          log.debug('[docker] containers observer started');
          this.stream   = stream;
          this.starting = false;
          this.attemps  = 0;
          resolve(true);
        })
        .catch((err) => {
          var max = 5;
          var msg = `[docker] (attemps: ${this.attemps + 1}/${max}) observer containers connect error`;
          log.info(msg, err.stack ? err.stack : err.toString());
          // reached the limit
          if (this.attemps > max) { reject(err); }
        });
    });
  }

  _stream_end() {
    log.info('[docker] containers observer, stream end');
    if (this.stoping) {
      this.stream = null;
      return this.stoping();
    }
    this.start();
  }

  _handler(event) {
    if (event) {
      log.debug("[docker] container event", JSON.stringify(event));
      this.publish(event.status, event);
    }
  }

  stop() {
    return defer((resolve, reject) => {
      if (this.stream) {
        try {
          this.stoping = resolve;
          this.stream.req.abort();
        } catch (err) {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  }
}
