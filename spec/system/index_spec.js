import h from 'spec/spec_helper';
import { config } from 'azk';
import { System } from 'azk/system';

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

  it("should expand options with template", function() {
    var manifest = {
      manifestDirName: "manifestDirName",
    }
    var options = {
      mount_folders: {
        "system_name": "<%= system.name %>",
        "persistent_folder": "<%= system.persistent_folders %>",
        "manifest_dir": "<%= manifest.dir %>",
        "manifest_project_name": "<%= manifest.project_name %>",
        "azk_default_domain": "<%= azk.default_domain %>",
        "azk_balancer_port": "<%= azk.balancer_port %>",
        "azk_balancer_ip": "<%= azk.balancer_ip %>",
      }
    }

    var system = new System(manifest, name, image, options);
    var mount_folders = system.row_mount_folders;
    h.expect(mount_folders).to.eql({
      "system_name": name,
      "persistent_folder": "/data",
      "manifest_dir": manifest.manifestDirName,
      "manifest_project_name": manifest.manifestDirName,
      "azk_default_domain": config('agent:balancer:host'),
      "azk_balancer_port": config('agent:balancer:port').toString(),
      "azk_balancer_ip": config('agent:balancer:ip'),
    })
  });

  it("should return a instancer container filter", function() {
    var manifest = { namespace: "mid.namespace" };
    var system   = new System(manifest, name, image);

    var instances = system.filter([
      { Names: [ "azk-mid.namespace-sys." + name ] },
      { Names: [ "azk-mid.namespace-sys." + name ] },
      { Names: [ "azk-mid.namespace-sys." + name + "-type.daemon" ] },
      { Names: [ "azk-mid.namespace-sys._not_set" ]}
    ]);

    h.expect(instances).to.include.something.eql(
      { Names: [ "azk-mid.namespace-sys." + name ] }
    );
    h.expect(instances).to.include.something.eql(
      { Names: [ "azk-mid.namespace-sys." + name + "-type.daemon" ] }
    );
  })
})
