import { Q, fs, config, log, defer } from 'azk';
import { net } from 'azk/utils';
import { Pid } from 'azk/utils/pid';
import { VM  } from 'azk/agent/vm';
var forever = require('forever-monitor');

var Unfsd = {
  child: null,
  port : null,
  ip   : null,

  start() {
    var self = this;
    if (!self.isRunnig()) {
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
          self.port  = port;
          self.child = forever.start(args, {
            max : 5,
            silent : true,
            pidFile: config("paths:unfsd_pid")
          });

          self.child.on('start', () => {
            log.info("unsfd started in %s port with file config", port, file);
            resolve();
          });
        }, reject);
      });
    } else {
      return Q();
    }
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

  mount(vm_name) {
    var point = config('agent:vm:mount_point');
    var ip    = net.calculateGatewayIp(config("agent:vm:ip"))
    var opts  = [
      `port=${this.port}`,
      `mountport=${this.port}`,
      'mountvers=3',
      'nfsvers=3',
      'nolock',
      'tcp',
    ]
    var mount = `sudo mount -o ${opts.join(',')} ${ip}:/ ${point}`
    var cmd = [
      `[ -d "${point}" ] || mkdir -p ${point}`,
      "[[ `mount` =~ " + point + " ]] || " + mount,
      "[[ `mount` =~ " + point + " ]]",
    ].join("; ");

    return VM.ssh(vm_name, cmd).then((code) => {
      if (code != 0) {
        log.error('not mount share files');
        //throw new Error('not mount share files');
      }
    });
  },

  unmount() {
  },

  isRunnig() {
    return (this.child && this.child.running);
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
