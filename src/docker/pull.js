import { _, lazy_require } from 'azk';
import { publish } from 'azk/utils/postal';
import { defer } from 'azk/utils/promises';
import { ProvisionNotFound, ProvisionPullError } from 'azk/utils/errors';

var lazy = lazy_require({
  XRegExp: ['xregexp', 'XRegExp']
});

var msg_regex = {
  pulling_another    : ['Layer.*another', 'Repository.*another'],
  pulling_verify     : 'Verifying Checksum',
  pulling_extracting : 'Extracting',
  pulling_complete   : 'Pull complete',
  pulling_digest     : 'Digest: (?<digest>.*)',
  pulling_repository : 'Pulling repository (?<repository>.*)',
  pulling_layers     : 'Pulling dependent layers',
  pulling_metadata   : 'Pulling metadata',
  pulling_fs_layer   : 'Pulling fs layer',
  pulling_up_to_date : 'Image is up to date',
  pulling_image      : 'Pulling image \((?<tag>.*)\) from (?<repository>.*), endpoint: (?<endpoint>.*)',
  pulling_finished   : 'Status: Downloaded newer image for (?<repository>.*)',
  download           : 'Downloading',
  download_complete  : 'Download complete',
};

function parse_status(msg) {
  var result = { type: "unknown", msg };

  _.find(msg_regex, (regexs, type) => {
    regexs = _.isArray(regexs) ? regexs : [regexs];
    return _.find(regexs, (regex) => {
      // Cache regex
      regex = lazy.XRegExp.cache(regex);
      var match = lazy.XRegExp.exec(msg, regex);
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
  });

  return result;
}

export function pull(docker, repository, tag, stdout, registry_result) {
  var image   = `${repository}:${tag}`;
  var promise = docker.createImage({
    fromImage: repository,
    tag: tag,
  });
  return promise.then((stream) => {
    return defer((resolve, reject) => {
      stream.on('data', (data) => {
        try {
          var msg             = JSON.parse(data.toString());
          msg.type            = "pull_msg";
          msg.registry_result = registry_result;

          if (msg.error) {
            if (msg.error.match(/404/) || msg.error.match(/not found$/)) {
              return reject(new ProvisionNotFound(image));
            }
            reject(new ProvisionPullError(image, msg.error));
          } else {
            // parse message
            msg.statusParsed = parse_status(msg.status);
            publish("docker.pull.status", msg);
          }
        } catch (e) {}
      });

      stream.on('end', () => {
        publish("docker.pull.status", { type: "pull_msg", statusParsed: {}, end: true, image});
        resolve(docker.findImage(image));
      });
    });
  });
}
