import { fs, path, _, config, async } from 'azk';
import { generator } from 'azk/generator';

export function extend(h) {
  h.mockManifest = function(data) {
    return async(function* () {
      // Copy structure
      var tmp = yield h.copyToTmp(h.fixture_path('test-app'));
      var default_img = config('docker:image_default');

      var command   = "socat TCP4-LISTEN:$PORT EXEC:`pwd`/src/bashttpd";
      var provision = ["ls -l ./src", "./src/bashttpd", "exit 0"];

      // Data merge
      data = _.merge({
        systems: {
          example: {
            envs: {
              ECHO_DATA: "data"
            }
            depends: ["db"],
            workdir: '/azk/<%= manifest.dir %>',
            image: default_img,
            mount_folders: true,
            balancer: true,
            command, provision,
            envs: {
              ECHO_DATA: "data"
            }
          },
          db: {
            workdir: '/azk/<%= manifest.dir %>',
            image: default_img,
            persistent_folders: [ "/data" ],
            mount_folders: false,
            balancer: false,
            command, provision,
          },
          empty: {
            image: config('docker:image_empty'),
            command: "/bin/false"
          },
        },
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

