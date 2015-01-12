import { _, t, Q, fs, async, defer, config, lazy_require, log, path } from 'azk';
import { DockerBuildNotFound, DockerBuildError, ManifestError } from 'azk/utils/errors';

var archiver = require('archiver');
var qfs      = require('q-io/fs');

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

function parseAddManifestFiles (archive, dockerfile_path, dockerfile_content) {
  return async(function* (notify) {

    var base_dir = path.dirname(dockerfile_path);

    // https://regex101.com/r/yT1jF9/1
    var dockerfileRegex = /^ADD\s+([^\s]+)\s+([^\s]+)$/gm;
    var capture = null;
    while( (capture = dockerfileRegex.exec(dockerfile_content)) ){
      var source      = path.join(base_dir, capture[1]);
      //var destination = capture[2];

      var exists = yield qfs.exists(source);
      if (!exists) {
        var msg = t("manifest.can_find_add_file_in_dockerfile");
        throw new ManifestError('', msg);
      }

      var stats = yield qfs.stat(source);
      if (stats.isDirectory()) {
        var dirname = source.split(path.sep)[source.split(path.sep).length - 1];
        var parent = path.dirname(source);
        archive.bulk([
          { expand: true, cwd: parent, src: [path.join(dirname, '**')], dest: '/' },
        ]);
      }
      else if (stats.isFile()) {
        console.log('adding file ' + source);
        var filename = source.split(path.sep)[source.split(path.sep).length - 1];
        archive.file(source, {name: filename});
      }
    }

    return archive;

  });
}

export function build(docker, image, opts) {
  return async(function* () {
    opts = _.extend({
      verbose: false,
      cache: true,
    }, opts);

    var image_name    = image.name || config('docker:repository');
    var build_options = { t: image_name, forcerm: true, nocache: !opts.cache, q: !opts.verbose };

    // include Dockerfile
    var archive = archiver('tar');
    archive.file(image.path, { name: 'Dockerfile' });

    // find ADDs on Dockerfile and include them
    var dockerfile_content = yield qfs.read(image.path);
    yield parseAddManifestFiles(archive, image.path, dockerfile_content);
    archive.finalize(function() {});

    return docker.buildImage(archive, build_options)
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
      })
      .catch(function(err) {
        console.log('\n>>---------\n err:', err, '\n>>---------\n');
        console.log('\n>>---------\n err.stack:', err.stack, '\n>>---------\n');
      });
  });
}
