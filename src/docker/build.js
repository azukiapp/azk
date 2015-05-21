import { _, Q, async, lazy_require, path } from 'azk';
import { DockerBuildError } from 'azk/utils/errors';

var archiver = require('archiver');
var qfs      = require('q-io/fs');

var lazy = lazy_require({
  JStream: 'jstream',
  XRegExp: ['xregexp', 'XRegExp']
});

var msg_regex = {
  get building_from      () { return new lazy.XRegExp('FROM (?<FROM>.*)'); },
  get building_maintainer() { return new lazy.XRegExp('MAINTAINER (?<MAINTAINER>.*)'); },
  get building_run       () { return new lazy.XRegExp('RUN (.*)'); },
  get building_cmd       () { return new lazy.XRegExp('CMD (.*)'); },
  get building_complete  () { return new lazy.XRegExp('Successfully built (?<IMAGE_ID>.*)'); },
};

function parse_stream(msg) {
  var result = {};
  _.find(msg_regex, (regex, type) => {
    var match  = lazy.XRegExp.exec(msg, regex);

    if (match) {
      result.type = type;
      result.command = match[0];
      result.value = match[1];
      result.input = match.input;

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

function parseAddManifestFiles (archive, dockerfile, content) {
  return async(function* () {
    var base_dir = path.dirname(dockerfile);

    // https://regex101.com/r/yT1jF9/2
    var dockerfileRegex = /^(?:ADD|COPY)\s+([^\s]+)\s+([^\s]+)$/gmi;
    // https://regex101.com/r/aC1xZ3/4
    var isUrlRegex      = /\b(?:(?:https?|ftp|file|ircs?):\/\/|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.;]*[A-Z0-9+&@#/%=~_|$]/gmi;
    var capture = null;
    while ( (capture = dockerfileRegex.exec(content)) ) {
      var source = path.join(base_dir, capture[1]);
      var isUrl  = isUrlRegex.test(capture[1]);

      // keep urls
      // TODO: support url download
      if (isUrl) { continue; }

      // Check if file/folder exist
      if (!(yield qfs.exists(source))) {
        throw new DockerBuildError('cannot_find_add_file_in_dockerfile', { dockerfile, source });
      }

      var stats = yield qfs.stat(source);
      if (stats.isDirectory()) {
        var dirname = source.split(path.sep)[source.split(path.sep).length - 1];
        var parent  = path.dirname(source);
        archive.bulk([
          { expand: true, cwd: parent, src: [path.join(dirname, '**')], dest: '/' },
        ]);
      } else if (stats.isFile()) {
        archive.file(source, { name: capture[1] });
      }
    }

    return archive;
  });
}

export function build(docker, options) {
  return async(function* (notify) {
    var opts = _.extend({
      cache: true
    }, options);

    // Check if "Dockerfile" exist
    var dockerfile = opts.dockerfile;
    if (!(yield qfs.exists(dockerfile))) {
      throw new DockerBuildError('cannot_find_dockerfile', { dockerfile });
    }

    if (_.isEmpty(opts.tag)) {
      throw Error("Not build a image with a empty tag");
    }

    // Create a tar and includes Dockerfile
    var archive = archiver('tar');
    archive.file(dockerfile, { name: 'Dockerfile' });

    // find ADDs on Dockerfile and include them
    var dockerfile_content = yield qfs.read(dockerfile);
    yield parseAddManifestFiles(archive, dockerfile, dockerfile_content);
    archive.finalize();

    // Options and defer
    var done = Q.defer();
    var build_options = { t: opts.tag, forcerm: true, nocache: !opts.cache, q: !opts.verbose };

    // Start stream
    var stream = yield docker.buildImage(archive, build_options).catch((err) => {
      throw new DockerBuildError('server_error', { dockerfile, err });
    });
    stream.on('end', () => done.resolve(docker.findImage(opts.tag)));

    // Parse json stream
    var from = null;
    var output = '';
    stream.pipe(new lazy.JStream()).on('data', (msg) => {
      if (!msg.error) {
        msg.type = 'build_msg';
        msg.statusParsed = parse_stream(msg.stream);
        if (opts.verbose && opts.stdout) {
          opts.stdout.write('  ' + msg.stream);
        }
        if (msg.statusParsed) {
          notify(msg);
          if (msg.statusParsed.type == "building_from") {
            from = msg.statusParsed.FROM;
          }
        }
        output += msg.stream;
      } else {
        output += msg.error;

        var capture = null;
        var check_and_capture = (regex) => {
          capture = msg.error.match(regex);
          return capture;
        };

        var reject = (key, opts = {}) => {
          var options = _.merge({ dockerfile, from, output }, opts);
          done.reject(new DockerBuildError(key, options));
        };

        if (msg.error.match(/image .* not found/)) {
          reject('not_found');
        } else if (msg.error.match(/returned a non-zero code/)) {
          output = output.replace(/^(.*)/gm, '    $1');
          reject('command_error', { output });
        } else if (check_and_capture(/Unknown instruction: (.*)/)) {
          reject('unknow_instrction_error', { instruction: capture[1] });
        } else {
          output = output.replace(/^(.*)/gm, '    $1');
          reject('unexpected_error', { output });
        }
      }
    });
    return done.promise;
  });
}
