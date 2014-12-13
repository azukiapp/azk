import h from 'spec/spec_helper';
import { config } from 'azk';
import { init } from 'azk/cmds/start';
import { ManifestRequiredError } from 'azk/utils/errors';

describe("Azk command", function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var cmds = init(UI);
  var argv = process.argv;

  describe("start", function() {
    var cmd = cmds.start;
  })
});
