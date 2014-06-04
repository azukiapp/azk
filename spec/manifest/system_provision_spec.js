import { path, config, async, defer, path } from 'azk';
import h from 'spec/spec_helper';
import { Manifest } from 'azk/manifest';
var qfs = require('q-io/fs');
import { RunCommandError } from 'azk/utils/errors';

describe("Azk system class, provision test", function() {
  var manifest, system;
  var events   = [];
  var progress = (event) => events.push(event);
  beforeEach(() => events = []);

  before(() => {
    var data = {
      systems: {
        other: {
          image: "azukiapp/busybox",
          provision: [ "ls -l src && exit 1" ]
        }
      }
    }
    return h.mockManifest(data).then((dir) => {
      manifest = new Manifest(dir);
      system   = manifest.system("example");
    });
  });

  it("should run provision", function() {
    return async(function* () {
      var file = path.join(manifest.manifestPath, 'bashttpd.conf');

      yield h.expect(qfs.exists(file)).to.eventually.fail;
      h.expect(system).to.have.property("provisioned", null);

      yield system.provision().progress(progress);
      yield h.expect(qfs.exists(file)).to.eventually.ok;
      h.expect(system).to.have.property("provisioned").and.instanceof(Date);

      h.expect(events).to.include.something.that.deep.equals({
        type: 'provision', system: system.name
      });
    });
  });

  it("should not run if it is already provisioned", function() {
    return async(function* () {
      var system = manifest.system("db");
      yield system.provision();
      yield system.provision().progress(progress);
      h.expect(events).to.not.include.something.that.deep.equals({
        type: 'provision', system: system.name
      });
      yield system.provision({ force_provision: true }).progress(progress);
      h.expect(events).to.include.something.that.deep.equals({
        type: 'provision', system: system.name
      });
    });
  });

  it("should return erro if provision fail", function() {
    var promise = manifest.system("other").provision();
    return h.expect(promise).to.eventually.rejectedWith(RunCommandError);
  });
});
