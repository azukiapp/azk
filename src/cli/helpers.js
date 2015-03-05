import { _, /*t,*/ log, lazy_require, config } from 'azk';
var ProgressBar = require('progress');

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
    return (msg) => {
      if (msg.type === "pull_msg") {

        // pull end
        if (msg.end) {
          cmd.ok('commands.helpers.pull.pull_ended', msg);
          return false;
        }

        // show pull progress bar
        var status = msg.statusParsed;
        switch (status.type) {
          case 'pulling_repository':
            // i.e. ⇲ pulling 5/14 layers. 22.42 MB left to download.
            var prettyBytes = require('pretty-bytes');
            cmd.ok('commands.helpers.pull.pull_start', {
              left_to_download_count : msg.registry_result.non_existent_locally_ids_count,
              total_registry_layers  : msg.registry_result.registry_layers_ids_count,
              left_to_download_size  : prettyBytes(msg.registry_result.total_layer_size_left),
            });

            // create progress bar
            this.bar = new ProgressBar('       [:bar] :percent  ', {
              complete: '=',
              incomplete: ' ',
              width: 47,
              total: msg.registry_result.total_layer_size_left
            });
            this.last_download_current = 0;
            break;

          case 'download_complete':
            this.last_download_current = 0;
            break;

          case 'download':
            // calculate chunk comparing with the last current progress
            var download_chunk = msg.progressDetail.current - this.last_download_current;
            this.bar.tick(download_chunk);
            // save last current progress
            this.last_download_current = msg.progressDetail.current;
            break;

          case 'pulling_another':
            cmd.ok('commands.helpers.pull.already_being', msg);
            break;
        }
        return false;
      }
      return msg;
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
