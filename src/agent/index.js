import { Q, config, defer, log } from 'azk';
import { Pid } from 'azk/utils/pid';
import { Server } from 'azk/agent/server';

var Agent = {
  start(opts) {
    return this.processWrapper();
  },

  agentPid() {
    log.info('get agent status');
    var a_pid = new Pid(config("paths:agent_pid"));
    log.info('agent is running: %s', a_pid.running);
    return a_pid;
  },


  processStateHandler() {
    var pid = this.agentPid();
    var gracefullExit = () => {
      Server.stop().then(() => {
        log.info('azk has been killed by signal');
        try {
          pid.unlink();
        } catch(e){}
        process.exit(0);
      }).fail((error) => {
        console.log(error.stack);
      });
    }

    try {
      pid.update(process.pid);
    } catch(e){}

    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT' , gracefullExit);
    process.on('SIGQUIT', gracefullExit);
  },

  processWrapper() {
    this.processStateHandler();
    return Server.start();
  },

  launchDaemon() {
    return defer((done) => {
      log.debug("Launching daemon");

      var child = require('child_process').fork(__filename, [], {
        silent     : false,
        detached   : true,
        cwd        : config('paths:azk_root'),
        env        : _.extend({
          //'SILENT' : cst.AZK_DEBUG ? !cst.AZK_DEBUG : true,
          //'HOME'   : process.env.HOME,
          //'AZK_DEBUG' : '*',
        }, process.env),
        stdio      : 'ignore'
      }, (err, stdout, stderr) => {
        if (err) done.reject(err.stack);
      });

      child.unref();
      child.once('message', (msg) => {
        process.emit('agent:daemon:ready');
        done.resolve();
      });
    });
  },
}

export { Agent };

//
// If this file is a main process, it means that
// this process is being forked by azk itself
//
if (require.main === module) {
  process.title = 'azk: Agent Daemonizer';
  Agent.processWrapper();
}
