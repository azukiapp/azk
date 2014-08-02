import { fs, path, _, config, async } from 'azk';
import { Generator } from 'azk/generator';
import { Manifest } from  'azk/manifest';

function socat(port) {
  return "socat TCP4-LISTEN:" + port + ",fork EXEC:`pwd`/src/bashttpd";
}

export function extend(h) {
  h.mockManifest = function(data) {
    return async(function* () {
      // Copy structure
      var tmp = yield h.copyToTmp(h.fixture_path('test-app'));
      var default_img = config('docker:image_default');

      var command   = `${socat('80')} &0>/dev/null ; ${socat('$HTTP_PORT')}`;
      var provision = ["ls -l ./src", "./src/bashttpd", "touch provisioned", "exit 0"];
      var mount     = {
        ".": '/azk/#{manifest.dir}'
      };

      // Data merge
      data = _.merge({
        systems: {
          example: {
            depends: ["db", "api"],
            workdir: '/azk/#{manifest.dir}',
            image: default_img,
            mount_folders: mount,
            persistent_folders: [ "/data" ],
            scalable: { default: 3 },
            http: true,
            command, provision,
            envs: {
              ECHO_DATA: "data"
            }
          },
          api: {
            depends: ["db"],
            workdir: '/azk/#{manifest.dir}',
            image: default_img,
            mount_folders: mount,
            scalable: true,
            http: true,
            command, provision,
            envs: {
              ECHO_DATA: "data"
            }
          },
          db: {
            workdir: '/azk/#{manifest.dir}',
            image: default_img,
            persistent_folders: [ "/data" ],
            mount_folders: mount,
            scalable: false,
            envs: {
              USER: "username",
              PASSWORD: "password",
            },
            ports: {
              http: "5000/tcp",
            },
            export_envs: {
              "#{system.name}_URL": "#{envs.USER}:#{envs.PASSWORD}@#{net.host}:#{net.port.http}"
            },
            command, provision,
          },
          empty: {
            up: false,
            image: config('docker:image_empty'),
            command: "/bin/false",
          },
          'test-image-opts': {
            image: default_img,
          },
          'ports-test': {
            image: config("docker:image_empty"),
            ports: {
              test_tcp: "80/tcp",
              test_udp: "53/udp",
              test_public: "443:443/tcp",
            },
          },
          'mount-test': {
            up: false,
            image: default_img,
            mount_folders: {
              ".": "/azk/#{system.name}",
              "..": "/azk/root",
            },
          },
          'expand-test': {
            up: false,
            image: default_img,
            mount_folders: {
              "system_name": "#{system.name}",
              "persistent_folder": "#{system.persistent_folders}",
              "manifest_dir": "#{manifest.dir}",
              "manifest_project_name": "#{manifest.project_name}",
              "azk_default_domain": "#{azk.default_domain}",
              "azk_balancer_port": "#{azk.balancer_port}",
              "azk_balancer_ip": "#{azk.balancer_ip}",
            },
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

