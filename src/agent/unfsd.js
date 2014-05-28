import { Q, fs, config, log, defer } from 'azk';
import { net } from 'azk/utils';
import { Pid } from 'azk/utils/pid';
var forever = require('forever-monitor');

var Unfsd = {
  child: null,

  start() {
    var self = this;
    var pid  = this.sharePid();
    return defer((resolve, reject) => {
      net.getPort().then((port) => {
        var file = self.__checkConfig();
        var args = [
          config("paths:unfsd"),
          "-s", "-d", "-p", "-t",
          "-n", port,
          "-m", port,
          "-e", file
        ]

        log.info("starting unfsd");
        self.child = forever.start(args, {
          max : 5,
          silent : false,
          pidFile: pid.file
        });

        self.child.on('start', () => {
          log.info("unsfd started in %s port with file config", port, file);
          resolve();
        });
      }, reject);
    });
  },

  stop() {
    return defer((resolve) => {
      log.debug("call to stop unsfd");
      if (this.child) {
        this.child.on('stop', () => {
          log.info('unsfd stoped');
          resolve();
        });
        log.info('stopping unsfd');
        this.child.stop();
      } else {
        resolve();
      }
    });
  },

  mount() {
  },

  unmount() {
  },

  isRunnig() {
    return this.sharePid().running;
  },

  sharePid() {
    log.info('get unfsd file service status');
    var u_pid = new Pid(config("paths:unfsd_pid"));
    log.info('unfsd is running: %s', u_pid.running);
    return u_pid;
  },

  __checkConfig() {
    var file = config('paths:unfsd_file');

    // set content
    fs.writeFileSync(file, [
      "# All",
      "/ " + net.calculateNetIp(config("agent:vm:ip")) + "(rw)"
    ].join("\n"));

    return file;
  }
}

export { Unfsd }
