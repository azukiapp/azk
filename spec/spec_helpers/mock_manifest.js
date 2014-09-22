import { fs, path, _, config, async } from 'azk';
import { Generator } from 'azk/generator';
import { Manifest } from  'azk/manifest';

function socat(port) {
  return "socat TCP4-LISTEN:" + port + ",fork EXEC:`pwd`/src/bashttpd";
}

export function extend(h) {

  h.mockManifestWithData = function(data) {
    return async(function* () {
      // Copy structure
      var tmp = yield h.copyToTmp(h.fixture_path('test-app'));

      // Read and write
      var generator = new Generator({});
      generator.render(data, path.join(tmp, config('manifest')));

      // Return a new project dir
      return new Manifest(tmp);
    });
  }

  h.mockManifest = function(data) {
    var default_img = config('docker:image_default');
    var command   = `${socat('80')} &0>/dev/null ; ${socat('53')} &0>/dev/null ; ${socat('$HTTP_PORT')}`;
    var provision = ["ls -l ./src", "./src/bashttpd", "touch provisioned", "exit 0"];
    var mounts    = {
      '/azk/#{manifest.dir}': '.'
    };
    var mounts_with_persitent = _.merge(mounts, {
      '/data': { type: 'persistent', value: 'data' },
    });

    // Data merge
    data = _.merge({
      systems: {
        example: {
          depends: ["db", "api"],
          workdir: '/azk/#{manifest.dir}',
          image: default_img,
          mounts: mounts_with_persitent,
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
          mounts: mounts,
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
          mounts: mounts_with_persitent,
          scalable: false,
          envs: {
            USER: "username",
            PASSWORD: "password",
          },
          ports: {
            http: "5000/tcp",
            dns: "53/tcp",
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
        'ports-disable': {
          image: default_img,
          ports: {
            test_tcp: "80/tcp",
            53: null,
          },
        },
        'mount-test': {
          up: false,
          image: default_img,
          mounts: {
            "/azk/#{system.name}": '.',
            "/azk/root": '/',
            "/azk/not-exists": { type: 'path', value: '../not-exists', required: false },
          },
          docker_extra: {
            start: { Privileged: true }
          }
        },
        'expand-test': {
          up: false,
          image: default_img,
          provision: [
            "system.name: #{system.name}",
            "system.persistent_folders: #{system.persistent_folders}",
            "manifest.dir: #{manifest.dir}",
            "manifest.path: #{manifest.path}",
            "manifest.project_name: #{manifest.project_name}",
            "azk.default_domain: #{azk.default_domain}",
            "azk.balancer_port: #{azk.balancer_port}",
            "azk.balancer_ip: #{azk.balancer_ip}",
          ],
        },
      },
      defaultSystem: 'api',
      bins: [
        { name: "console", command: ["bundler", "exec"] }
      ]
    }, data);

    return h.mockManifestWithData(data);
  }
}

