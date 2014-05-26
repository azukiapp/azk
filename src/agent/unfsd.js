import { Q, fs, config, log, defer } from 'azk';
import { net } from 'azk/utils';
import { Pid } from 'azk/utils/pid';
var forever = require('forever-monitor');

var Unfsd = {
  child: null,

  start() {
    var self = this;
    var pid  = this.sharePid();
    return Q.async(function* () {
      if (!self.isRunnig()) {
        var port = yield net.getPort();
        var args = [
          config("paths:unfsd"),
          "-s", "-d", "-p", "-t",
          "-n", port,
          "-m", port,
          "-e", self.__checkConfig()
        ]

        self.child = forever.start(args, {
          max : 5,
          silent : false,
          pidFile: pid.file
        });
      }
    })();
  },

  stop() {
    return defer((resolve) => {
      if (this.child) {
        this.child.on('stop', () => {
          resolve();
        });
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
      "/ " + net.calculateNetIp(config("agent:vm:ip")) + "/24(rw)"
    ].join("\n"));

    return file;
  }
}

export { Unfsd }
