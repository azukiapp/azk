import { lazy_require, path } from 'azk';
import { promiseResolve, promiseReject } from 'azk/utils/promises';
import { groupFromRegex } from 'azk/utils/regex_helper';
// matchFirstRegex, matchAllRegex, fulltrim,

var lazy = lazy_require({
  spawnAsync : ['azk/utils/spawn_helper'],
});

var gitHelper = {
  version: (scanFunction) => {
    return lazy.spawnAsync('git', ['--version'], scanFunction)
    .then((result) => {
      if (result.error_code === 0) {
        var git_version = groupFromRegex(result.message, /.*?(\d+\.\d+\.\d+)/, 1);
        return promiseResolve(git_version);
      } else {
        return promiseReject(result.message);
      }
    });
  },

  revParse: (revision, git_path, scanFunction) => {
    return lazy.spawnAsync('git', [
      '--git-dir',
      git_path,
      'rev-parse',
      '--verify',
      revision
    ], scanFunction)
    .then((result) => {
      if (result.error_code === 0) {
        const commit_id = result.message.substring(0, 7);
        return promiseResolve(commit_id);
      } else {
        return promiseReject(result.message);
      }
    });
  },

  lsRemote: (git_url, scanFunction) => {
    return lazy.spawnAsync('git', [
      'ls-remote',
      git_url,
    ], scanFunction)
    .then((result) => {
      if (result.error_code === 0) {
        return promiseResolve(result.message);
      } else {
        return promiseReject(result.message);
      }
    });
  },

  clone: (git_url, git_branch_tag_commit, dest_folder, is_new_git, scanFunction) => {
    var git_params = [
      'clone',
      git_url,
      dest_folder,
      '--recursive'
    ];

    if (is_new_git) {
      // git_params.push('--single-branch');
      git_params.push('--branch');
      git_params.push(git_branch_tag_commit);
    }

    return lazy.spawnAsync('git', git_params, scanFunction)
    .then((result) => {
      if (result.error_code === 0) {
        return promiseResolve(result.message);
      } else {
        return promiseReject(result.message);
      }
    });
  },

  pull: (git_url, git_branch_tag_commit, dest_folder, scanFunction) => {
    return lazy.spawnAsync('git', [
      '--git-dir',
      path.resolve(dest_folder, '.git'),
      '--work-tree',
      path.resolve(dest_folder),
      'pull',
      git_url,
      git_branch_tag_commit
    ], scanFunction)
    .then((result) => {
      if (result.error_code === 0) {
        return promiseResolve(result.message);
      } else {
        return promiseReject(result.message);
      }
    });
  },

  checkout: (git_branch_tag_commit, dest_folder, scanFunction) => {
    return lazy.spawnAsync('git',
      ['-C', dest_folder, 'checkout', git_branch_tag_commit],
      scanFunction)
    .then((result) => {
      if (result.error_code === 0) {
        return promiseResolve(result.message);
      } else {
        return promiseReject(result.message);
      }
    });
  },

};

export default gitHelper;
