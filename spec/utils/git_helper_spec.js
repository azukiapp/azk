import h from 'spec/spec_helper';
import { default as gitHelper } from 'azk/utils/git_helper';

describe("Git Helper", function() {
  let outputs = [];
  let ui = h.mockUI(beforeEach, outputs);

  it("should run git --version", function() {
    const command = gitHelper.version(ui.stdout().write);
    return h.expect(command)
      .to.eventually.not.be.undefined
      .then(() => {
        h.expect(outputs[0]).to.equal('$> git --version');
        h.expect(outputs[1]).to.match(/git version/);
      });
  });

  it("should run git rev-parse HEAD", function() {
    const azkDevPathMatch = __dirname.match(process.env.AZK_ROOT_PATH);
    /**/console.log('\n>>---------\n azkDevPathMatch:\n', azkDevPathMatch, '\n>>---------\n');/*-debug-*/
    const isAzkDev = azkDevPathMatch !== null;
    /**/console.log('\n>>---------\n isAzkDev:\n', isAzkDev, '\n>>---------\n');/*-debug-*/
  });

});
