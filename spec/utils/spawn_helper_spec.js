import h from 'spec/spec_helper';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  spawnHelper: ['azk/utils/spawn_helper'],
  printOutput: ['azk/utils/spawn_helper'],
});

describe("Spawn Helper", function() {
  let outputs = [];
  let ui = h.mockUI(beforeEach, outputs);

  it("should printOutput do not print if verbose_level = 0", function() {
    const result = lazy.printOutput(ui.ok, 0, '[azk]', 'DATA');
    h.expect(result).to.be.undefined;
    h.expect(outputs.length).to.equal(0);
  });

});
