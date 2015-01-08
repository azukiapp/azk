import { _, t, Q, fs, async, defer, config, lazy_require, log } from 'azk';
import { DockerBuildNotFound, DockerBuildError } from 'azk/utils/errors';


var tar = require('tar-fs')

lazy_require(this, {
  parseRepositoryTag: ['dockerode/lib/util'],
  docker: ['azk/docker', 'default'],
  uuid: 'node-uuid',
});

var msg_regex = {
  building_from       : new XRegExp('FROM (?<FROM>.*)'),
  building_maintainer : new XRegExp('MAINTAINER (?<MAINTAINER>.*)'),
  building_run        : new XRegExp('RUN (.*)'),
  building_cmd        : new XRegExp('CMD (.*)'),
  building_complete   : new XRegExp('Successfully built (?<IMAGE_ID>.*)'),
}

function parse_stream(msg) {
  var result = {};
  _.find(msg_regex, (regex, type) => {
    var match  = XRegExp.exec(msg, regex);

    if (match) {
      result['type'   ] = type;
      result['command'] = match[0];
      result['value'  ] = match[1];
      result['input'  ] = match.input;

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

export function build(docker, image, opts) {
  return async(function* () {
    opts = _.extend({
      verbose: false,
      cache: true,
    }, opts);

    // TODO: Make name with notations
    var image_name    = image.name || config('docker:repository');
    var build_options = { t: image_name, nocache: !opts.cache, q: !opts.verbose }

    var dir           = path.dirname(image.path);
    var dirStream     = yield tar.pack(dir);

    return docker.buildImage(dirStream, build_options)
      .then((stream) => {
        return defer((resolve, reject, notify) => {
          stream.on('data', (data) => {
            try {
              var msg  = JSON.parse(data.toString());
              msg.type = "build_msg";

              if (msg.error) {
                if (msg.error.match(/404/) || msg.error.match(/not found$/)) {
                  return reject(new DockerBuildNotFound(image));
                }
                reject(new DockerBuildError(image, msg.error));
              } else {
                msg.statusParsed = parse_stream(msg.stream);
                if (msg.statusParsed) {
                  notify(msg);
                }
                if (stdout) {
                  stdout.write(msg.stream + "\n");
                }
              }
            } catch (e) {};
          });

          stream.on('end', () => resolve(docker.findImage(image_name)));
        });
      });
  });
}
