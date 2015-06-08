import { _, lazy_require, path, fsAsync } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, originalDefer } from 'azk/utils/promises';
import { DockerBuildError } from 'azk/utils/errors';

var lazy = lazy_require({
  JStream : 'jstream',
  XRegExp : ['xregexp', 'XRegExp'],
  qfs     : 'q-io/fs',
  archiver: 'archiver',
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

export function build(docker, options) {
  return async(function* () {
    var opts = _.extend({
      cache: true
    }, options);

    // Check if "Dockerfile" exist
    var dockerfile = opts.dockerfile;
    if (!(yield fsAsync.exists(dockerfile))) {
      throw new DockerBuildError('cannot_find_dockerfile', { dockerfile });
    }

    if (_.isEmpty(opts.tag)) {
      throw Error("Not build a image with a empty tag");
    }

    // Create a tar and includes Dockerfile
    var archive = lazy.archiver('tar');
    var src     = ["**", "!Dockerfile"];
    var cwd     = path.dirname(dockerfile);

    // Filter with .dockerignore
    var ignore  = path.join(cwd, '.dockerignore');
    var exists_ignore = yield lazy.qfs.exists(ignore);
    if (exists_ignore) {
      var ignore_content = yield lazy.qfs.read(ignore);
      ignore_content = ignore_content.trim().split('\n');
      src = src.concat(ignore_content.map((entry) => `!${entry}`));
    }

    // Add files
    archive.bulk([{ expand: true, cwd, src, dest: '/' }]);
    archive.file(dockerfile, { name: 'Dockerfile' });
    if (exists_ignore) {
      archive.file(ignore, { name: '.dockerignore' });
    }
    archive.finalize();

    // Options and defer
    var done = originalDefer();
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
          publish("docker.build.status", msg);
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
