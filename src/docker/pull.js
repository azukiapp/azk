import { _, lazy_require } from 'azk';
import { publish } from 'azk/utils/postal';
import { defer } from 'azk/utils/promises';
import { ProvisionNotFound, ProvisionPullError } from 'azk/utils/errors';

var lazy = lazy_require({
  XRegExp: ['xregexp', 'XRegExp']
});

var msg_regex = {
  get pulling_another    () { return new lazy.XRegExp('Repository.*another'); },
  get pulling_repository () { return new lazy.XRegExp('Pulling repository (?<repository>.*)'); },
  get pulling_layers     () { return new lazy.XRegExp('Pulling dependent layers'); },
  get pulling_metadata   () { return new lazy.XRegExp('Pulling metadata'); },
  get pulling_fs_layer   () { return new lazy.XRegExp('Pulling fs layer'); },
  get pulling_up_to_date () { return new lazy.XRegExp('Image is up to date'); },
  get pulling_image      () { return new lazy.XRegExp(
    'Pulling image \((?<tag>.*)\) from (?<repository>.*), endpoint: (?<endpoint>.*)'
  ); },
  get download           () { return new lazy.XRegExp('Downloading'); },
  get download_complete  () { return new lazy.XRegExp('Download complete'); },
};

function parse_status(msg) {
  var result = {};
  _.find(msg_regex, (regex, type) => {
    var match  = lazy.XRegExp.exec(msg, regex);
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
        publish("docker.pull.status", { type: "pull_msg", end: true, image});
        resolve(docker.findImage(image));
      });
    });
  });
}
