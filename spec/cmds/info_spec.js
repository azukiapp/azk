import h from 'spec/spec_helper';
import { config } from 'azk';
import { init } from 'azk/cmds/info';
import { ManifestRequiredError } from 'azk/utils/errors';

describe("Azk command info, run in an", function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var cmd = init(UI);

  describe("invalid SoS dir", function() {
    it("should return error if not have manifest", function() {
      return h.tmp_dir().then((dir) => {
        cmd.cwd = dir;
        return h.expect(cmd.run()).to.rejectedWith(ManifestRequiredError);
      });
    });
  });

  describe("valid SoS dir", function() {
    var manifest;

    before(() => {
      var data = { };
      return h.mockManifest(data).then((mf) => {
        manifest = mf;
      });
    });

    it("should show systems information", function() {
      cmd.cwd = manifest.manifestPath;
      return cmd.run().then(() => {
        h.expect(outputs[0]).to.match(/example:/);
        h.expect(outputs[0]).to.match(RegExp(config('docker:image_default')));
        h.expect(outputs[0]).to.match(/command:.*socat/);
      });
    });
  });
});
