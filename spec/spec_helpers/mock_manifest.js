import { fs, path, _, config, async } from 'azk';
import { Generator } from 'azk/generator';
import { Manifest } from  'azk/manifest';

export function extend(h) {
  h.mockManifest = function(data) {
    return async(function* () {
      // Copy structure
      var tmp = yield h.copyToTmp(h.fixture_path('test-app'));
      var default_img = config('docker:image_default');

      var command   = "socat TCP4-LISTEN:$PORT EXEC:`pwd`/src/bashttpd";
      var provision = ["ls -l ./src", "./src/bashttpd", "exit 0"];
      var mount     = {
        ".": '/azk/<%= manifest.dir %>'
      };

      // Data merge
      data = _.merge({
        systems: {
          example: {
            depends: ["db", "api"],
            workdir: '/azk/<%= manifest.dir %>',
            image: default_img,
            mount_folders: mount,
            balancer: true,
            command, provision,
            envs: {
              ECHO_DATA: "data"
            }
          },
          api: {
            depends: ["db"],
            workdir: '/azk/<%= manifest.dir %>',
            image: default_img,
            mount_folders: mount,
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
            mount_folders: mount,
            balancer: false,
            command, provision,
          },
          empty: {
            up: false,
            image: config('docker:image_empty'),
            command: "/bin/false",
          },
        },
        default: 'example',
        bins: [
          { name: "console", command: ["bundler", "exec"] }
        ]
      }, data);

      // Read and write
      var generator = new Generator({});
      generator.render(data, path.join(tmp, config('manifest')));

      // Return a new project dir
      return new Manifest(tmp);
    });
  }
}

