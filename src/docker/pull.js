import { _, defer, lazy_require } from 'azk';
import { ProvisionNotFound, ProvisionPullError } from 'azk/utils/errors';

/* global XRegExp */
lazy_require(this, {
  XRegExp: ['xregexp', 'XRegExp']
});

var msg_regex = {
  pulling_another    : new XRegExp('Repository.*another'),
  pulling_repository : new XRegExp('Pulling repository (?<repository>.*)'),
  pulling_layers     : new XRegExp('Pulling dependent layers'),
  pulling_metadata   : new XRegExp('Pulling metadata'),
  pulling_fs_layer   : new XRegExp('Pulling fs layer'),
  pulling_image      : new XRegExp(
    'Pulling image \((?<tag>.*)\) from (?<repository>.*), endpoint: (?<endpoint>.*)'
  ),
  download: new XRegExp('Downloading'),
  download_complete: new XRegExp('Download complete'),
};

function parse_status(msg) {
  var result = {};
  _.find(msg_regex, (regex, type) => {
    var match  = XRegExp.exec(msg, regex);
    if (match) {
      result.type = type;
      _.each(regex.xregexp.captureNames, function(key) {
        if (match[key]) {
          result[key] = match[key];
        }
      });
      return true;
    }
  });
  return result;
}

export function pull(docker, repository, tag, stdout, registry_result) {
  var image   = `${repository}:${tag}`;
  var promise = docker.createImage({
    fromImage: repository,
    tag: tag,
  });

  var bar = null;
  var registry_layers_ids_count = 0;
  // var non_existent_locally_ids_count = 0;
  // var total_layer_size_left = 0;
  var will_show_simple_progress_bar = false;

  if (!_.isNull(registry_result)) {
    will_show_simple_progress_bar = true;
    registry_layers_ids_count      = registry_result.registry_layers_ids_count;
    // non_existent_locally_ids_count = registry_result.non_existent_locally_ids_count;
    // total_layer_size_left          = registry_result.total_layer_size_left;
  }

  if (will_show_simple_progress_bar) {
    var ProgressBar = require('progress');
    var progressMessage = ' [:bar] :percent';
    bar = new ProgressBar(progressMessage, {
      complete: '=',
      incomplete: ' ',
      width: 23,
      total: registry_layers_ids_count + 1
    });
  }

  return promise.then((stream) => {
    return defer((resolve, reject, notify) => {
      stream.on('data', (data) => {
        // TODO: add support chucks
        try {

          var msg  = JSON.parse(data.toString());
          msg.type = "pull_msg";

          if (msg.error) {
            if (msg.error.match(/404/) || msg.error.match(/not found$/)) {
              return reject(new ProvisionNotFound(image));
            }
            reject(new ProvisionPullError(image, msg.error));
          } else {
            msg.statusParsed = parse_status(msg.status);

            if ( will_show_simple_progress_bar &&
                msg.statusParsed &&
                msg.statusParsed.type === 'download_complete') {
              // show a simple progress-bar
              bar.tick(1);
            } else if (!will_show_simple_progress_bar && msg.statusParsed) {
              // show messages from docker remote pull
              notify(msg);
            }
            if (stdout) {
              stdout.write(msg.status + "\n");
            }
          }
        } catch (e) {}
      });

      stream.on('end', () => {
        notify({ type: "pull_msg", end: true, image});
        resolve(docker.findImage(image));
      });
    });
  });
}
