import h from 'spec/spec_helper';
import { default as gitHelper } from 'azk/utils/git_helper';
import { config, path } from 'azk';

describe('Git Helper', function() {
  const azkRootPath = config('paths:azk_root');
  const git_path = path.join(azkRootPath, '.git');

  it('should run scan `git --version` to stdout', function() {
    let outputs = [];
    const writeToOutput = (data) => {
      outputs.push(data.toString());
    };
    return gitHelper.version(writeToOutput)
    .then(() => {
      h.expect(outputs).to.containSubset(['$> git --version']);
    });
  });

  it('should return version on `git --version`', function() {
    const command = gitHelper.version(null);
    return h.expect(command)
      .to.eventually.to.match(/\d+\.\d+\.\d+/);
  });

  it('should run git rev-parse HEAD', function() {
    const command = gitHelper.revParse('HEAD', git_path, null);
    return h.expect(command)
      .to.eventually.to.not.be.undefined;
  });

  it('should lsRemote get remote data @slow', function() {
    const GIT_URL = 'https://github.com/azukiapp/azkdemo';
    const command = gitHelper.lsRemote(GIT_URL, null);
    return h.expect(command)
      .to.eventually.to.match(/HEAD/g);
  });

  it('should clone, pull and checkout @slow', function() {
    return h.tmp_dir().then((tmp_path) => {
      const GIT_URL = 'https://github.com/azukiapp/azkdemo';
      const GIT_BRANCH_TAG_COMMIT = 'master';
      const DEST_FOLDER = tmp_path;

      return gitHelper.clone(
        GIT_URL,
        GIT_BRANCH_TAG_COMMIT,
        DEST_FOLDER,
        false,
        null
      )
      .then((result) => {
        h.expect(result).to.match(/Cloning into/g);
      })
      .then(() => {
        return gitHelper.pull(
          GIT_URL,
          'final',
          DEST_FOLDER,
          null
        );
      })
      .then((result) => {
        h.expect(result).to.match(/final/g);
      })
      .then(() => {
        return gitHelper.checkout(
          '77284eb',
          DEST_FOLDER,
          null
        );
      })
      .then((result) => {
        h.expect(result).to.match(/77284eb/);
      });
    });

  });

});
