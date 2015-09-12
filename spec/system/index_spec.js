import h from 'spec/spec_helper';
import { _, path, utils } from 'azk';
import { config, version } from 'azk';
import { System } from 'azk/system';
import { net } from 'azk/utils';

describe("Azk system class, main set", function() {
  var system;
  var name = "mysystem", image = config('docker:image_default');

  before(() => {
    system = new System({}, name, image);
  });

  it("should parse image", function() {
    h.expect(system).to.have.property("name", name);
    h.expect(system).to.have.deep.property("image.name", image);
  });

  it("should merge options with default_options", function() {
    var regex = RegExp(`echo ".*${name}.*"; exit 1`);
    h.expect(system).to.have.property("command").and.match(regex);
    h.expect(system).to.have.property("depends").and.eql([]);
    h.expect(system).to.have.property("envs").and.eql({});
    h.expect(system).to.have.property("shell", "/bin/sh");
    h.expect(system).to.have.property("workdir", "/");
    h.expect(system).to.have.property("scalable").and.eql({ default: 1, limit: 1 });
    h.expect(system).to.have.property("default_options").to.fail;
  });

  it("should merge options with dns_servers", function() {
    system.options = _.defaults(system.default_options, {
      dns_servers: ['208.67.222.222', '208.67.222.220']
    });

    h.expect(system).to.have.property("dns_servers").and.eql(['208.67.222.222', '208.67.222.220']);
  });

  describe("with valid manifest", function() {
    var manifest, system;

    before(() => {
      var data = { };
      return h.mockManifest(data).then((mf) => {
        manifest = mf;
        system   = manifest.system('example');
      });
    });

    it("should expand and return exports envs", function() {
      var envs;
      var db   = manifest.system('db', true);
      var api  = manifest.system('api', true);

      envs = db.expandExportEnvs({
        envs: { USER: "username", PASSWORD: "key" },
        net: { host: "host.example", port: { 5000: 1234 }, }
      });
      h.expect(envs).to.have.property("DB_URL", "username:key@host.example:1234");
      h.expect(envs).to.have.property("DB_HTTP_PORT", 1234);
      h.expect(envs).to.have.property("DB_5000_PORT", 1234);
      h.expect(envs).to.have.property("DB_HTTP_HOST", "host.example");
      h.expect(envs).to.have.property("DB_5000_HOST", "host.example");

      envs = api.expandExportEnvs({ net: { port: { 5000: 1234 }}});
      h.expect(envs).to.have.property("API_URL", `http://${api.hostname}`);
    });

    describe("in a system with volumes to be mounted", function() {
      it("should expand options with template", function() {
        var system    = manifest.system('expand-test');
        var provision = system.options.provision;
        h.expect(provision).to.include(`system.name: ${system.name}`);
        h.expect(provision).to.include(`manifest.dir: ${manifest.manifestDirName}`);
        h.expect(provision).to.include(`manifest.path: ${manifest.manifestPath}`);
        h.expect(provision).to.include(`manifest.project_name: ${manifest.manifestDirName}`);
        h.expect(provision).to.include(`azk.version: ${version}`);
        h.expect(provision).to.include(`azk.default_domain: ${config('agent:balancer:host')}`);
        h.expect(provision).to.include(`azk.default_dns: ${net.nameServers().toString()}`);
        h.expect(provision).to.include(`azk.balancer_port: ${config('agent:balancer:port').toString()}`);
        h.expect(provision).to.include(`azk.balancer_ip: ${config('agent:balancer:ip')}`);
      });

      it("should return a mounts property", function() {
        var system  = manifest.system('mount-test');
        var mounts  = system.mounts;
        h.expect(mounts).to.have.property(
          "/azk/" + system.name, utils.docker.resolvePath(manifest.manifestPath)
        );
        h.expect(mounts).to.have.property(
          "/azk/root", utils.docker.resolvePath(path.resolve(manifest.manifestPath, "/"))
        );
        h.expect(mounts).to.not.have.property('/azk/not-exists');
      });

      it("should return a persistent volumes", function() {
        var system  = manifest.system("db");
        var mounts  = system.mounts;
        var folder  = path.join(
          config("paths:persistent_folders"),
          manifest.namespace, "data"
        );
        h.expect(mounts).to.have.property("/data", folder);
      });

      it("should return sync volumes", function() {
        var system       = manifest.system("example-sync");
        var share_folder;
        if (config('agent:requires_vm')) {
          share_folder = path.join(config('agent:vm:mount_point'), manifest.cwd);
        } else {
          share_folder = manifest.cwd;
        }
        var sync_folder  = path.join(
          config("paths:sync_folders"),
          manifest.namespace, system.name, manifest.cwd
        );
        var persistent_folder  = path.join(
          config("paths:persistent_folders"),
          manifest.namespace
        );

        var mounts  = system.mounts;
        h.expect(mounts).to.have.property('/azk',     path.join(sync_folder,       '.'));
        h.expect(mounts).to.have.property('/azk/bin', path.join(sync_folder,       'bin'));
        h.expect(mounts).to.have.property('/azk/lib', path.join(share_folder,      'lib'));
        h.expect(mounts).to.have.property('/azk/tmp', path.join(persistent_folder, 'tmp'));
        h.expect(mounts).to.have.property('/azk/log', path.join(persistent_folder, 'log'));

        var shellVolumes = system.shellOptions().volumes;
        h.expect(shellVolumes).to.have.property('/azk',     path.join(share_folder,      '.'));
        h.expect(shellVolumes).to.have.property('/azk/bin', path.join(sync_folder,       'bin'));
        h.expect(shellVolumes).to.have.property('/azk/lib', path.join(sync_folder,       'lib'));
        h.expect(shellVolumes).to.have.property('/azk/tmp', path.join(persistent_folder, 'tmp'));
        h.expect(shellVolumes).to.have.property('/azk/log', path.join(persistent_folder, 'log'));

        var daemonVolumes = system.daemonOptions().volumes;
        h.expect(daemonVolumes).to.have.property('/azk',     path.join(sync_folder,       '.'));
        h.expect(daemonVolumes).to.have.property('/azk/bin', path.join(sync_folder,       'bin'));
        h.expect(daemonVolumes).to.have.property('/azk/lib', path.join(share_folder,      'lib'));
        h.expect(daemonVolumes).to.have.property('/azk/tmp', path.join(persistent_folder, 'tmp'));
        h.expect(daemonVolumes).to.have.property('/azk/log', path.join(persistent_folder, 'log'));
      });

      it("should return default ports", function() {
        h.expect(system).to.have.deep.property("ports.http");
      });
    });

    it("should return a depends systems", function() {
      var depends = system.dependsInstances;
      var names = _.map(depends, (system) => { return system.name; });
      h.expect(names).to.eql(["db", "api"]);
    });

    describe("with custom http domains", function() {
      it("should return the correct default domain", function() {
        var system = manifest.system("example-http-domain");
        h.expect(system.hostname).to.eql(`${system.name}.${config('agent:balancer:host')}`);
      });

      it("should return the correct custom ip", function() {
        var custom_ip = '192.168.0.1';
        process.env.HOST_IP = custom_ip;

        var data = { };
        return h.mockManifest(data).then((mf) => {
          manifest = mf;
          system   = manifest.system('example-http-domain');
          h.expect(system.hostname).to.eql(custom_ip);
        });
      });

      it("should return the correct custom ip", function() {
        var custom_ip           = '192.168.0.1';
        process.env.HOST_IP     = custom_ip;
        var custom_domain       = 'my.domain.com';
        process.env.HOST_DOMAIN = custom_domain;

        var data = { };
        return h.mockManifest(data).then((mf) => {
          manifest = mf;
          system   = manifest.system('example-http-domain');
          h.expect(system.hostname).to.eql(custom_domain);
        });
      });

    });

    it("should be marked as supporting provisioned", function() {
      h.expect(system).to.have.property("provisioned").and.null;

      var date = new Date();
      system.provisioned = date;
      h.expect(system).to.have.property("provisioned").and.eql(date);
    });

    describe("call to daemonOptions", function() {
      var options;
      before(() => { options = system.daemonOptions(); });

      it("should return default docker options", function() {
        h.expect(options).to.have.property("daemon", true);
        h.expect(options).to.have.property("working_dir").and.eql(system.workdir);
        h.expect(options).to.have.property("dns").and.eql(net.nameServers());
        h.expect(options).to.have.property("env").and.eql({
          HTTP_PORT: "5000", ECHO_DATA: "data", FROM_DOT_ENV: "azk is beautiful"
        });
      });

      it("should return options with annotations", function() {
        h.expect(options).to.have.deep.property("annotations.azk.mid", manifest.namespace);
        h.expect(options).to.have.deep.property("annotations.azk.type", "daemon");
        h.expect(options).to.have.deep.property("annotations.azk.sys", system.name);
        h.expect(options).to.have.deep.property("annotations.azk.seq", 1);
      });

      it("should return mount folder in volumes and data folders in local_volumes", function() {
        h.expect(options).to.have.property("volumes").and.eql(system.mounts);
      });

      it("should map system ports to docker ports", function() {
        var system  = manifest.system('ports-test');
        var options = system.daemonOptions();

        h.expect(options).to.deep.have.property("ports.80/tcp").and.eql([{
          HostIp: config('agent:dns:ip')
        }]);
        h.expect(options).to.deep.have.property("ports.53/udp").and.eql([{
          HostIp: config('agent:dns:ip')
        }]);
        h.expect(options).to.deep.have.property("ports.443/tcp").and.eql([{
          HostIp: config('agent:dns:ip'), HostPort: "5252"
        }]);
      });

      it("should merge system ports with image ports", function() {
        var system  = manifest.system('ports-static');
        return system.image.check().then((image) => {
          return image.inspect().then((image_data) => {
            var options = system.daemonOptions({ image_data });

            h.expect(options).to.deep.have.property("ports.80/tcp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
            h.expect(options).to.deep.have.property("ports.81/tcp").and.eql([{
              HostIp: config('agent:dns:ip'), HostPort: "81"
            }]);
            h.expect(options).to.deep.have.property("ports.53/udp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
            h.expect(options).to.deep.have.property("ports.443/tcp").and.eql([{
              HostIp: config('agent:dns:ip'), HostPort: "5252"
            }]);
          });
        });
      });

      it("should orderly and merged system ports with image ports", function() {
        var system  = manifest.system('ports-static');
        return system.image.check().then((image) => {
          return image.inspect().then((image_data) => {
            var options = system.daemonOptions({ image_data });
            h.expect(options).to.deep.have.property("ports_orderly.0.name").and.eql('81/tcp');
            h.expect(options).to.deep.have.property("ports_orderly.1.name").and.eql('443/tcp');
            h.expect(options).to.deep.have.property("ports_orderly.2.name").and.eql('53/udp');
            h.expect(options).to.deep.have.property("ports_orderly.3.name").and.eql('80/tcp');
          });
        });
      });

      it("should merge ports system without override", function() {
        var system  = manifest.system('ports-static');
        return system.image.check().then((image) => {
          return image.inspect().then((image_data) => {
            var options = system.daemonOptions({ image_data });

            h.expect(options).to.deep.have.property("ports.80/tcp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
            h.expect(options).to.deep.have.property("ports.81/tcp").and.eql([{
              HostIp: config('agent:dns:ip'), HostPort: "81"
            }]);
            h.expect(options).to.deep.have.property("ports.53/udp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
            h.expect(options).to.deep.have.property("ports.443/tcp").and.eql([{
              HostIp: config('agent:dns:ip'), HostPort: "5252"
            }]);
          });
        });
      });

      it("should disable image ports with option `disable`", function() {
        var system = manifest.system('ports-disable');
        return system.image.check().then((image) => {
          return image.inspect().then((image_data) => {
            var options = system.daemonOptions({ image_data });

            h.expect(options).to.deep.have.property("ports.80/tcp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
            h.expect(options).to.have.property("ports").and.not.have.property("53/udp");
          });
        });
      });

      it("should support custom ports", function() {
        var custom = {
          ports: {
            "http": "8080/tcp",
            "6379/tcp": "6379/tcp",
          }
        };
        var system  = manifest.system('ports-static');
        var options = system.daemonOptions(custom);

        h.expect(options).to.deep.have.property("ports.8080/tcp").and.eql([{
          HostIp: config('agent:dns:ip')
        }]);
        h.expect(options).to.deep.have.property("ports.6379/tcp").and.eql([{
          HostIp: config('agent:dns:ip')
        }]);

        h.expect(options).to.deep.have.property("env.HTTP_PORT", "8080");
        h.expect(options).to.not.deep.have.property("env.6379_PORT");
        h.expect(options).to.not.deep.have.property("env.6379/TCP_PORT");
      });

      it("should support custom options", function() {
        // Customized options
        var custom  = {
          mounts : {
            "/azk"  : { type: 'path', value: '.' },
            "/data" : { type: 'persistent', value: 'data' },
          },
          workdir : "/azk",
          envs    : { FOO: "BAR" },
          sequencies: { daemon: 2 }
        };
        var options = system.daemonOptions(custom);
        var mounts  = options.volumes;
        var folder  = path.join(
          config("paths:persistent_folders"),
          manifest.namespace, "data"
        );

        h.expect(options).to.have.property("working_dir", "/azk");
        h.expect(options).to.have.property("volumes");
        h.expect(options).to.have.deep.property("annotations.azk.seq", 2);
        h.expect(options).to.have.property("env").and.eql({
          ECHO_DATA    : "data",
          FROM_DOT_ENV : "azk is beautiful",
          HTTP_PORT    : "5000",
          FOO          : "BAR"
        });

        h.expect(mounts).to.have.property(
          "/azk", utils.docker.resolvePath(manifest.manifestPath)
        );
        h.expect(mounts).to.have.property("/data", folder);
      });

      it("should support custom dns_servers", function() {
        // Customized options
        var nameservers = ['208.67.222.222', '208.67.222.220'];
        var custom      = { dns_servers: nameservers };
        var options     = system.daemonOptions(custom);

        h.expect(options).to.have.property("dns").and.eql(net.nameServers(nameservers));
      });

      it("should extract options from image_data", function() {
        var system  = manifest.system("mount-test");
        var options = system.daemonOptions();
        h.expect(options).to.have.deep.property("extra.HostConfig.Privileged", 'true');
      });

      it("should extract extra docker parameters", function() {
        var system = manifest.system('mount-test');
        return system.image.check().then((image) => {
          return image.inspect().then((image_data) => {
            var options = system.daemonOptions({ image_data });
            h.expect(options).to.have.property("working_dir", "/data");
            h.expect(options).to.have.property("command").and.eql(image_data.Config.Cmd);
            h.expect(options).to.have.deep.property("ports.80/tcp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
            h.expect(options).to.have.deep.property("ports.53/udp").and.eql([{
              HostIp: config('agent:dns:ip')
            }]);
          });
        });
      });
    });

    describe("call to shellOptions", function() {
      var options;
      before(() => {
        var custom = { stdout: {} };
        options = system.shellOptions(custom);
      });

      it("should return default docker options", function() {
        h.expect(options).to.have.property("daemon", false);
        h.expect(options).to.have.property("ports").and.empty;
        h.expect(options).to.have.property("working_dir").and.eql(system.workdir);
        h.expect(options).to.have.property("dns").and.eql(net.nameServers());
        h.expect(options).to.have.property("env").and.eql({
          ECHO_DATA: "data", FROM_DOT_ENV: "azk is beautiful"
        });
      });

      it("should return options with annotations", function() {
        h.expect(options).to.have.deep.property("annotations.azk.type", "shell");
        h.expect(options).to.have.deep.property("annotations.azk.sys", system.name);
        h.expect(options).to.have.deep.property("annotations.azk.seq", 1);
        h.expect(options).to.have.deep.property("annotations.azk.shell", "script");
      });

      it("should return option with stdio maped", function() {
        // Customized options
        var custom = {
          interactive: true,
          stdout: { stdout: true, isTTY : true },
          stderr: { stderr: true },
          stdin : { stdin : true },
        };
        var options = system.shellOptions(custom);
        h.expect(options).to.have.property("tty").and.ok;
        h.expect(options).to.have.deep.property("stdout.stdout").and.ok;
        h.expect(options).to.have.deep.property("stderr.stderr").and.ok;
        h.expect(options).to.have.deep.property("stdin.stdin").and.ok;
      });

      it("should support custom options", function() {
        // Customized options
        var custom = {
          interactive: true,
          stdout: {},
        };
        var options = system.shellOptions(custom);
        h.expect(options).to.have.deep.property("annotations.azk.shell", "interactive");
      });
    });
  });
});
