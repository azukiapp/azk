import { lazy_require, path } from 'azk';
import { promiseResolve, promiseReject } from 'azk/utils/promises';
import { groupFromRegex } from 'azk/utils/regex_helper';

var lazy = lazy_require({
  spawnAsync : ['azk/utils/spawn_helper'],
});

var gitHelper = {
  version(scanFunction) {
    let git_params = ['--version'];
    let format = (result) => groupFromRegex(result.message, /.*?(\d+\.\d+\.\d+)/, 1);
    return this._spawn_async(git_params, scanFunction, format);
  },

  revParse(revision, git_path, scanFunction) {
    let git_params = [
      '--git-dir', git_path, 'rev-parse', '--verify', revision
    ];
    let format = (result) => result.message.substring(0, 7);
    return this._spawn_async(git_params, scanFunction, format);
  },

  show(revision, format, git_path, scanFunction) {
    let git_params = [
      '--git-dir', git_path, 'show', '-s', '--format=' + format, revision
    ];
    return this._spawn_async(git_params, scanFunction);
  },

  lsRemote(git_url, scanFunction) {
    let git_params = [ 'ls-remote', git_url ];
    return this._spawn_async(git_params, scanFunction);
  },

  clone(git_url, git_branch_tag_commit, dest_folder, is_new_git, scanFunction) {
    var git_params = [ 'clone', git_url, dest_folder, '--recursive' ];

    if (is_new_git) {
      git_params.push('--branch');
      git_params.push(git_branch_tag_commit);
    }

    return this._spawn_async(git_params, scanFunction);
  },

  pull(git_url, git_branch_tag_commit, dest_folder, scanFunction) {
    let git_params = [
      '--git-dir',
      path.resolve(dest_folder, '.git'),
      '--work-tree',
      path.resolve(dest_folder),
      'pull',
      git_url,
      git_branch_tag_commit
    ];

    return this._spawn_async(git_params, scanFunction);
  },

  checkout(git_branch_tag_commit, dest_folder, scanFunction) {
    let git_params = ['-C', dest_folder, 'checkout', git_branch_tag_commit];
    return this._spawn_async(git_params, scanFunction);
  },

  _spawn_async(git_params, scanFunction, format = null) {
    if (!format) {
      format = (result) => result.message;
    }

    return lazy
      .spawnAsync('git', git_params, scanFunction)
      .then((result) => {
        if (result.error_code === 0) {
          return promiseResolve(format(result));
        } else {
          return promiseReject(result.message);
        }
      });
  },

};

export default gitHelper;
