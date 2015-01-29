import h from 'spec/spec_helper';
import { init } from 'azk/cmds/start';

describe("Azk command", function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var cmds = init(UI);

  describe("start", function() {
    cmds.start;
  });
});
