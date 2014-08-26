import { Q, _, defer } from 'azk';
import { XRegExp } from 'xregexp';
import { ProvisionNotFound, ProvisionPullError } from 'azk/utils/errors';

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
}

function parse_status(msg) {
  var result = {};
  _.find(msg_regex, (regex, type) => {
    var match  = XRegExp.exec(msg, regex);
    if (match) {
      result['type'] = type;
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

export function pull(docker, repository, tag, stdout) {
  var image   = `${repository}:${tag}`;
  var promise = docker.createImage({
    fromImage: repository,
    tag: tag,
  });

  return promise.then((stream) => {
    return defer((resolve, reject, notify) => {
      stream.on('data', (data) => {
        var msg  = JSON.parse(data.toString());
        msg.type = "pull_msg";
        if (msg.error) {
          if (msg.error.match(/404/) || msg.error.match(/not found$/)) {
            return reject(new ProvisionNotFound(image));
          }
          reject(new ProvisionPullError(image, msg.error));
        } else {
          msg.statusParsed = parse_status(msg.status);
          if (msg.statusParsed) {
            notify(msg);
          }
          if (stdout) {
            stdout.write(msg.status + "\n");
          }
        }
      });

      stream.on('end', () => resolve(docker.findImage(image)));
    });
  })
}
