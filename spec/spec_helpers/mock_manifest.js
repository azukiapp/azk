import { fs, path, _, config, async } from 'azk';
import { generator } from 'azk/generator';

export function extend(h) {
  h.mockManifest = function(data) {
    return async(function* () {
      // Copy structure
      var tmp = yield h.copyToTmp(h.fixture_path('test-app'));
      var default_img = config('docker:image_default');

      var command = 'while true ; do (echo -e "HTTP/1.1\\n\\n $(date) $(ECHO_DATA)") | nc -l 1500; test $? -gt 128 && break; sleep 1; done';

      // Data merge
      data = _.merge({
        systems: [
          {
            name: 'example',
            depends: ["db"],
            workdir: '/azk/<%= manifest.dir %>',
            image: default_img,
            sync_files: true,
            balancer: true,
            command: command,
            envs: {
              ECHO_DATA: "data"
            }
          }, {
            name: "db",
            workdir: '/azk/<%= manifest.dir %>',
            image: default_img,
            persistent_dir: true,
            sync_files: false,
            balancer: false,
            command: command,
          }, {
            name: "empty",
            image: config('docker:image_empty'),
            command: "/bin/false"
          }
        ],
        default: 'example',
        bins: [
          { name: "console", command: ["bundler", "exec"] }
        ]
      }, data);

      // Read and write
      generator.render(data, path.join(tmp, config('manifest')));

      // Return a new project dir
      return tmp;
    });
  }
}

