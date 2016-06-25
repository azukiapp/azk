import { path, _, config, fsAsync } from 'azk';
import { async } from 'azk/utils/promises';
import { Generator } from 'azk/generator';
import { Manifest } from  'azk/manifest';
import { promisify } from 'azk/utils/promises';

var glob = promisify(require('glob'));
var Handlebars = require('handlebars');

export function extend(h) {

  function socat(port) {
    return "socat TCP4-LISTEN:" + port + ",fork EXEC:`pwd`/src/bashttpd";
  }

  function fixture_path() {
    return async(function* () {
      var app_path = yield h.copyToTmp(h.fixture_path('test-app'));

      // Expand templates
      var content, file;
      var templates = yield glob('**/*.mustache', { cwd: app_path });
      for (var i = 0; i < templates.length; i++) {
        file    = path.join(app_path, templates[i]);
        content = (yield fsAsync.readFile(file)).toString();
        content = Handlebars.compile(content)({
          default_img: config("docker:image_default")
        });
        yield fsAsync.writeFile(file, content);
      }

      return app_path;
    });
  }

  h.mockManifestWithContent = function(content) {
    return async(function* () {
      // Copy structure
      var tmp = yield fixture_path();

      // Write content to manifest file
      yield fsAsync.writeFile(path.join(tmp, config('manifest')), content);

      // Return a new project dir
      return new Manifest(tmp);
    });
  };

  h.mockManifestWithData = function(data) {
    return async(function* () {
      // Copy structure
      var tmp = yield fixture_path();

      // Read and write
      var generator = new Generator({});
      yield generator.render(data, path.join(tmp, config('manifest')));

      // Return a new project dir
      return new Manifest(tmp);
    });
  };

  h.mockManifest = function(data) {
    var default_img = config('docker:image_default');
    var command   = `${socat('80')} &0>/dev/null ; ${socat('53')} &0>/dev/null ; ${socat('$HTTP_PORT')}`;
    var provision = ["ls -l ./src", "(./src/bashttpd || true)", "touch provisioned", "exit 0"];
    var mounts    = {
      '/azk/#{manifest.dir}': '.'
    };

    var mounts_with_persitent = _.merge(mounts, {
      '/data': { type: 'persistent', value: 'data' },
    });

    var mounts_with_sync = {
      '/azk'           : { type: 'sync', value: '.' },
      '/azk/special'   : { type: 'sync', value: 'special:\'` "\\'},
      '/azk/bin'       : { type: 'sync', value: 'bin', shell: true },
      '/azk/lib'       : { type: 'sync', value: 'lib', shell: true, daemon: false },
      '/azk/tmp'       : { type: 'persistent', value: 'tmp' },
      '/azk/log'       : { type: 'persistent', value: 'log' },
    };

    // Data merge
    data = _.merge({
      systems: {
        example: {
          depends: ["db", "api"],
          workdir: '/azk/#{manifest.dir}',
          shell: "/bin/bash",
          image: { docker: default_img },
          mounts: _.cloneDeep(mounts_with_persitent),
          scalable: { default: 3 },
          http: true,
          command, provision,
          envs: {
            ECHO_DATA: "data"
          }
        },
        "example-extends": {
          extends: "example",
          scalable: { default: 1 },
        },
        "example-without-command": {
          extends: "example",
          command: '__NULL__',
        },
        api: {
          depends: ["db"],
          workdir: '/azk/#{manifest.dir}',
          image: { docker: default_img },
          mounts: _.cloneDeep(mounts),
          scalable: true,
          http: true,
          command, provision,
          envs: {
            ECHO_DATA: "data"
          }
        },
        db: {
          workdir: '/azk/#{manifest.dir}',
          image: { docker: default_img },
          mounts: _.cloneDeep(mounts_with_persitent),
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
          image: { docker: config('docker:image_empty') },
          command: "/bin/false",
        },
        'test-image-opts': {
          image: { docker: default_img },
        },
        'ports-test': {
          image: { docker: default_img },
          ports: {
            test_tcp: "80/tcp",
            test_udp: "53/udp",
            test_public: "5252:443/tcp",
          },
        },
        'ports-static': {
          image: { docker: default_img },
          ports: {
            81: "81:81/tcp",
            443: "5252:443/tcp",
          },
        },
        'ports-disable': {
          image: { docker: default_img },
          ports: {
            test_tcp: "80/tcp",
            53: null,
          },
        },
        'mount-test': {
          up: false,
          image: { docker: default_img },
          mounts: {
            "/azk/#{system.name}": '.',
            "/azk/root": '/',
            "/azk/not-exists": { type: 'path', value: '../not-exists', required: false },
            "/azk/not-resolve": { type: 'path', value: "/azk/not-resolve", resolve: false },
          },
          docker_extra: {
            HostConfig: { Privileged: true }
          }
        },
        'expand-test': {
          up: false,
          image: { docker: default_img },
          provision: [
            "system.name: #{system.name}",
            "manifest.dir: #{manifest.dir}",
            "manifest.path: #{manifest.path}",
            "manifest.project_name: #{manifest.project_name}",
            "azk.version: #{azk.version}",
            "azk.default_domain: #{azk.default_domain}",
            "azk.default_dns: #{azk.default_dns}",
            "azk.balancer_port: #{azk.balancer_port}",
            "azk.balancer_ip: #{azk.balancer_ip}",
            "env.FOO (host): #{env.FOO}",
            "env.BAR (host): #{env.BAR}",
            "PORT: ${PORT}",
            "HOST_DOMAIN: ${HOST_DOMAIN}",
          ],
        },
        'example-sync': {
          extends: "example",
          command: "exit 0",
          mounts: _.cloneDeep(mounts_with_sync),
        },
        'example-http-domain': {
          extends: "example",
          http: {
            domains: [
              "#{env.HOST_DOMAIN}",
              "#{env.HOST_IP}",
              "#{system.name}.#{azk.default_domain}",
            ]
          },
        },
      },
      defaultSystem: 'api',
      bins: [
        { name: "console", command: ["bundler", "exec"] }
      ]
    }, data);

    return h.mockManifestWithData(data);
  };
}
