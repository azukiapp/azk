import h from 'spec/spec_helper';
import { config, _ } from 'azk';
import { System } from 'azk/system';
import { Manifest } from 'azk/manifest';

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

    it("should return a depends systems", function() {
      var depends = system.dependsInstances;
      var names = _.map(depends, (system) => { return system.name });
      h.expect(names).to.eql(["db", "api"]);
    });
  });
})
