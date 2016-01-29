import h from 'spec/spec_helper';
import { default as gitHelper } from 'azk/utils/git_helper';
import { config, path } from 'azk';

describe("Git Helper", function() {
  let outputs = [];
  const ui = h.mockUI(beforeEach, outputs);
  const azkRootPath = config('paths:azk_root');
  const git_path = path.join(azkRootPath, '.git');

  it("should run scan `git --version` to stdout", function() {
    const command = gitHelper.version(ui.stdout().write);
    return h.expect(command)
      .to.eventually.not.be.undefined
      .then(() => {
        h.expect(outputs[0]).to.equal('$> git --version');
        h.expect(outputs[1]).to.match(/git version/);
      });
  });

  it("should return version on `git --version`", function() {
    const command = gitHelper.version(null);
    return h.expect(command)
      .to.eventually.to.match(/\d+\.\d+\.\d+/);
  });

  it("should run git rev-parse HEAD", function() {
    return gitHelper.revParse('HEAD', git_path)
    .then((commit_id) => {
      h.expect(commit_id).to.not.be.undefined;
    });
  });

  it("should lsRemote get remote data @slow", function() {
    return gitHelper.lsRemote('https://github.com/azukiapp/azk.git')
    .then((result) => {
      h.expect(result).to.match(/HEAD/g);
    });
  });

});
