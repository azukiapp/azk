import { _, /*t,*/ log, lazy_require, config } from 'azk';

/* global AgentClient, Configure */
lazy_require(this, {
  AgentClient: ['azk/agent/client', 'Client'],
  Configure: ['azk/agent/configure', 'Configure'],
});

var Helpers = {
  requireAgent(cli) {
    return AgentClient
      .status()
      .then((status) => {
        if (!status.agent && !cli.non_interactive) {
          var question = {
            type    : 'confirm',
            name    : 'start',
            message : 'commands.agent.start_before',
            default : 'Y'
          };

          return cli.prompt(question)
            .then((answers) => {
              var cmd = "azk agent start";
              return answers.start ? cli.execSh(cmd) : false;
            });
        }
      })
      .then(() => {
        return AgentClient.require();
      });
  },

  configure(cli) {
    cli.ok('configure.loading_checking');
    return (new Configure(cli))
      .run()
      .then((configs) => {
        cli.ok('configure.loaded');
        return configs;
      });
  },

  manifestValidate(cmd, manifest) {
    if (config('flags:show_deprecate')) {
      _.each(manifest.validate(), (error) => {
        cmd[error.level](`manifest.validate.${error.key}`, error);
      });
    }
  },

  vmStartProgress(cmd) {
    return (event) => {
      if (!event) {
        return;
      }

      var context = event.context || "agent";
      var keys    = ["status", context];

      switch (event.type) {
        case "status":
          // running, starting, not_running, already_installed
          switch (event.status) {
            case "not_running":
            case "already_installed":
              cmd.fail([...keys].concat(event.status), event.data);
              break;
            case "error":
              if (event.data instanceof Error) {
                cmd.fail(event.data.toString());
              } else {
                cmd.fail([...keys].concat(event.status), event);
              }
              break;
            default:
              if (event.keys) {
                cmd[event.status || "ok"](event.keys, event.data);
              } else {
                cmd.ok([...keys].concat(event.status), event.data);
              }
          }
          break;
        case "try_connect":
          var tKey = [...keys].concat("progress");
          log.info_t(tKey, event);
          cmd.ok(tKey, event);
          break;
        case "ssh":
          if (context === "stderr") {
            break;
          } else {
            log.debug(event);
          }
          break;
        default:
          log.debug(event);
      }
    };
  },

  newPullProgress(cmd) {
    var prettyBytes = require('pretty-bytes');

    return (msg) => {
      if (msg.type !== "pull_msg") {
        return msg;
      }

      // pull end
      if (msg.end) {
        cmd.ok('commands.helpers.pull.pull_ended', msg);
        return false;
      }

      // manual message, not parsed
      if (msg.traslation) {
        cmd.ok(msg.traslation, msg.data);
        return false;
      }

      if (!this.last_download_current) {
        this.last_download_current = {};
      }

      // parsed messages
      // show pull progress bar
      var status = msg.statusParsed;
      switch (status.type) {
        case 'download_complete':
          this.bar && this.bar.tick(1);
          // if (msg.id && this.last_download_current[msg.id]) {
          //   console.log('finished', msg.id);
          //   delete this.last_download_current[msg.id];
          // }
          break;

        case 'download':

          // // console.log('\n>>------------\n msg.id:', msg.id, '\n<<------------\n');
          // // console.log('\n>>------------\n this.last_download_current[msg.id]:',
          // //  this.last_download_current[msg.id], '\n<<------------\n');

          // // calculate chunk comparing with the last current progress
          // if (msg.id && this.last_download_current[msg.id]) {
          //   download_chunk = msg.progressDetail.current - this.last_download_current[msg.id];
          // } else if (!this.last_download_current[msg.id]) {
          //   this.last_download_current[msg.id] = 0;
          //   download_chunk = msg.progressDetail.current;

          //   console.log('\n>>------------\n msg.progressDetail:', msg.id,
          //     prettyBytes(msg.progressDetail.total), '\n<<------------\n');
          // }

          // // console.log('\n>>------------\n download_chunk:', download_chunk, '\n<<------------\n');

          if (_.isUndefined(this.bar)) {
            // i.e. ⇲ pulling 5/14 layers. 22.42 MB left to download.
            cmd.ok('commands.helpers.pull.pull_start', {
              left_to_download_count : msg.registry_result.non_existent_locally_ids_count,
              total_registry_layers  : msg.registry_result.registry_layers_ids_count,
              left_to_download_size  : prettyBytes(msg.registry_result.total_layer_size_left),
            });

            // create progress bar
            this.bar = cmd.createProgressBar('     [:bar] :percent  ', {
              complete: '=',
              incomplete: ' ',
              width: 50,
              total: msg.registry_result.non_existent_locally_ids_count * 100
            });
          }

          // console.log('\n>>------------\n this.bar:', this.bar, '\n<<------------\n');

          // var isOverflow = this.bar.curr + download_chunk >= this.bar.total;

          // if (isOverflow) {

          //   /****** DEBUG ******************************************************************/
          //   /******************************************************************************/
          //   var debugSource = this.last_download_current;
          //   var util = require('util');
          //   var scrubbed = util.inspect(debugSource, {
          //     showHidden: true,
          //     depth: 3,
          //     colors: true
          //   });

          //   console.log(
          //     '\n>>------------------------------------------------------\n' +
          //     '  source: ( ' + __filename + ' )'                             +
          //     '\n  ------------------------------------------------------\n' +
          //     '  $ this.last_download_current'                                                     +
          //     '\n  ------------------------------------------------------\n' +
          //        scrubbed                                                    +
          //     '\n<<------------------------------------------------------\n'
          //   );

          //   /******************************************************************************/
          //   /****** \DEBUG ***************************************************************/

          // }

          // if (download_chunk > 0 && !isOverflow) {
          //   this.bar.tick(download_chunk);
          // }
          // // save last current progress
          // if (msg.id) {
          //   this.last_download_current[msg.id] = msg.progressDetail.current;
          // }
          break;

        case 'pulling_another':
          cmd.ok('commands.helpers.pull.already_being', msg);
          break;
      }
      return false;
    };
  },

  escapeCapture(callback) {
    // Escape sequence
    var escapeBuffer = false;
    var escape = false;

    return (event) => {
      if (event.type == "stdin_pipe") {
        var stdin  = event.data[0].stdin;
        var stream = event.data[0].stream;
        var container = event.id;
        var stopped = false;

        stdin.on('data', function (key) {
          if (stopped) {
            return false;
          }

          var ch = key.toString(stdin.encoding || 'utf-8');

          if (escapeBuffer && ch === '~') {
            escapeBuffer = false;
            escape = true;
          } else if (ch === '\r') {
            escapeBuffer = true;
            stream.write(key);
          } else {
            if (escape) {
              stopped = callback(ch, container);
              escape = false;
            } else {
              stream.write(key);
            }
            escapeBuffer = false;
          }
        });
      }
      return true;
    };
  }
};

export { Helpers };
