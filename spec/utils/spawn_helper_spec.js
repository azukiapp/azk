import h from 'spec/spec_helper';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  spawnAsync: ['azk/utils/spawn_helper'],
  printOutput: ['azk/utils/spawn_helper'],
});

describe("Spawn Helper", function() {
  let outputs = [];
  let ui = h.mockUI(beforeEach, outputs);
  let stdOut = ui.stdout().write.bind(ui);

  it("should printOutput do not print if verbose_level = 0", function() {
    lazy.printOutput(stdOut, 0, '[azk]', 'DATA');
    h.expect(outputs.length).to.equal(0);
  });

  it("should printOutput print if verbose_level = 1", function() {
    lazy.printOutput(stdOut, 1, '[azk]', 'DATA');
    h.expect(outputs[0]).to.match(/\[azk\] DATA/);
  });

  it("should spawnAsync should return result even without scanFunction", function() {
    const spawnAsync_promise = lazy.spawnAsync('git', ['--version'], undefined);

    return spawnAsync_promise.then((result) => {
      h.expect(result.error_code).to.equal(0);
      h.expect(result.message).to.match(/git version/);
      h.expect(outputs.length).to.equal(0);
    });
  });

  it("should spawnAsync should return result and call scanFunction", function() {
    const scanFunction = stdOut;
    const spawnAsync_promise = lazy.spawnAsync('git', ['--version'], scanFunction);

    return spawnAsync_promise.then((result) => {
      h.expect(result.error_code).to.equal(0);
      h.expect(result.message).to.match(/git version/);
      h.expect(outputs[0]).to.equal('$> git --version');
      h.expect(outputs[1]).to.match(/git version/);
    });
  });

});
