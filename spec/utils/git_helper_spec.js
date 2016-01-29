import h from 'spec/spec_helper';
import { default as gitHelper } from 'azk/utils/git_helper';
import { config, path, fsAsync } from 'azk';

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
    const azkRootPath = config('paths:azk_root');
    const git_path = path.join(azkRootPath, '.git');
    return fsAsync.exists(git_path)
    .then((exists) => {
      h.expect(exists).to.be.equal(true);
      return gitHelper.revParse('HEAD', git_path, ui.stdout().write)
      .then((commit_id) => {
        h.expect(commit_id).to.not.be.undefined;
      });
    });
  });

});
