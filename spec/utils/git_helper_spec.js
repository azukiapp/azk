import h from 'spec/spec_helper';
import { default as gitHelper } from 'azk/utils/git_helper';

describe("Git Helper", function() {
  let outputs = [];
  let ui = h.mockUI(beforeEach, outputs);

  it("should run git --version", function() {
    const command = gitHelper.version({verbose_level: 1, ui});
    return h.expect(command)
      .to.eventually.not.be.undefined
      .then(() => {
        /**/console.log('\n>>---------\n outputs:\n', outputs, '\n>>---------\n');/*-debug-*/
      });
  });

  it("should run git rev-parse HEAD", function() {
    /**/console.log('\n>>---------\n __dirname:\n', __dirname, '\n>>---------\n');/*-debug-*/
  });

});
