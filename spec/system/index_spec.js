import h from 'spec/spec_helper';
import { config, _, path } from 'azk';
import { System } from 'azk/system';
import { Manifest } from 'azk/manifest';
import { net } from 'azk/utils';

describe("system class", function() {
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
    h.expect(system).to.have.property("depends").eql([]);
    h.expect(system).to.have.property("envs").eql({});
    h.expect(system).to.have.property("shell", "/bin/sh");
    h.expect(system).to.have.property("workdir", "/");
  });

  describe("with valid manifest", function() {
    var manifest, system;

    before(() => {
      var data = { };
      return h.mockManifest(data).then((mf) => {
        manifest = mf;
        system   = manifest.systemDefault;
      });
    });

    describe("in a system with volumes to be mounted", function() {
      it("should expand options with template", function() {
        var system = manifest.system('expand_test');
        var mount_folders = system.raw_mount_folders;
        h.expect(mount_folders).to.eql({
          "system_name": system.name,
          "persistent_folder": "/data",
          "manifest_dir": manifest.manifestDirName,
          "manifest_project_name": manifest.manifestDirName,
          "azk_default_domain": config('agent:balancer:host'),
          "azk_balancer_port": config('agent:balancer:port').toString(),
          "azk_balancer_ip": config('agent:balancer:ip'),
        })
      });

      it("should return a volumes property", function() {
        var system  = manifest.system('mount_test');
        var volumes = system.volumes;
        h.expect(volumes).to.have.property(
          manifest.manifestPath, "/azk/" + system.name
        );
        h.expect(volumes).to.have.property(
          path.resolve(manifest.manifestPath, ".."), "/azk/root"
        );
      });

      it("should return a persistent volumes", function() {
        var system  = manifest.system("db");
        var volumes = system.persistent_volumes;
        var folder  = path.join(config("agent:vm:persistent_folders"), manifest.namespace, system.name, "data");
        h.expect(volumes).to.have.property(folder, "/data");
      })
    });

    it("should return a depends systems", function() {
      var depends = system.dependsInstances;
      var names = _.map(depends, (system) => { return system.name });
      h.expect(names).to.eql(["db", "api"]);
    });

    describe("call to daemonOptions", function() {
      var options;

      before(() => options = system.daemonOptions());

      it("should return default docker options", function() {
        h.expect(options).to.have.property("daemon", true);
        h.expect(options).to.have.property("ports").and.empty;
        h.expect(options).to.have.property("working_dir").and.eql(system.workdir);
        h.expect(options).to.have.property("env").and.eql({ ECHO_DATA: "data"});
        h.expect(options).to.have.property("dns").and.eql(net.nameServers());
      });

      it("should return options with annotations", function() {
        h.expect(options).to.have.deep.property("annotations.type", "daemon");
        h.expect(options).to.have.deep.property("annotations.sys", system.name);
        h.expect(options).to.have.deep.property("annotations.seq", 1);
      });

      it("should return ma folder in volumes and data folders in local_volumes", function() {
        h.expect(options).to.have.property("volumes").and.eql(system.volumes);
        h.expect(options).to.have.property("local_volumes").and.eql(system.persistent_volumes);
      });

      it("should support custom options", function() {
        // Customized options
        var options = system.daemonOptions({
          volumes : { "./": "/azk" },
          local_volumes : { "./data": "/data" },
          workdir : "/azk",
          envs    : { FOO: "BAR" },
          sequencies: { daemon: 2 }
        });

        h.expect(options).to.have.property("working_dir", "/azk");
        h.expect(options).to.have.property("volumes")
          .and.have.property("./").and.eql("/azk");
        h.expect(options).to.have.property("local_volumes")
          .and.have.property("./data").and.eql("/data");
        h.expect(options).to.have.property("env")
          .and.eql({ ECHO_DATA: "data", FOO: "BAR"});
        h.expect(options).to.have.deep.property("annotations.seq", 3);
      });
    });

    describe("call to shellOptions", function() {
      var options = {};

      before(() => options = system.shellOptions({
        stdout: {}
      }));

      it("should return default docker options", function() {
        h.expect(options).to.have.property("daemon", false);
        h.expect(options).to.have.property("ports").and.empty;
        h.expect(options).to.have.property("working_dir").and.eql(system.workdir);
        h.expect(options).to.have.property("env").and.eql({ ECHO_DATA: "data"});
        h.expect(options).to.have.property("dns").and.eql(net.nameServers());
      });

      it("should return options with annotations", function() {
        h.expect(options).to.have.deep.property("annotations.type", "shell");
        h.expect(options).to.have.deep.property("annotations.sys", system.name);
        h.expect(options).to.have.deep.property("annotations.seq", 1);
        h.expect(options).to.have.deep.property("annotations.shell", "script");
      });

      it("should return option with stdio maped", function() {
        // Customized options
        var options = system.shellOptions({
          interactive: true,
          stdout: { stdout: true, isTTY : true },
          stderr: { stderr: true },
          stdin : { stdin : true },
        });

        h.expect(options).to.have.property("tty").and.ok;
        h.expect(options).to.have.deep.property("stdout.stdout").and.ok;
        h.expect(options).to.have.deep.property("stderr.stderr").and.ok;
        h.expect(options).to.have.deep.property("stdin.stdin").and.ok;
      })

      it("should support custom options", function() {
        // Customized options
        var options = system.shellOptions({
          interactive: true,
          stdout: {},
        });

        h.expect(options).to.have.deep.property("annotations.shell", "interactive");
      });
    })
  });
})
