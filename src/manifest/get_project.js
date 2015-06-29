import { path } from 'azk';
import { async, promiseReject } from 'azk/utils/promises';
import { UIProxy } from 'azk/cli/ui';
import { matchFirstRegex, matchAllRegex, fulltrim } from 'azk/utils/regex_helper';
import { spawnAsync } from 'azk/utils/spawn_helper';
import { GitCallError } from 'azk/utils/errors';

var url  = require('url');

export class GetProject extends UIProxy {
  static valid(url) {
    var isValid = /\//;
    return isValid.test(url);
  }

  static parseCommandOptions(opts) {
    var is_start      = opts.start;
    var system_name   = opts.system;
    var git_repo      = opts['git-repo'];
    var git_ref       = opts['git-ref'];
    var verbose_level = opts.verbose;

    if (!is_start) {
      // it's not azk start - continue 'azk scale'
      return null;
    }

    if (!system_name && !opts['git-repo']) {
      // nothing was passed - continue 'azk scale'
      return null;
    }

    if (system_name) {
      var valid_system_name = system_name.match(/^[a-zA-Z0-9-]+$/);
      if (!valid_system_name) {
        // invalid system name, must be a git repository link
        git_repo = system_name;
      } else {
        // must be a system name - continue 'azk scale'
        return null;
      }
    }

    // https://regex101.com/r/wG9dS2/1
    // parsing git_repo
    var match = matchFirstRegex(git_repo, /^(.*?)(#(.*))?$/g);
    git_repo = match[1];
    var git_repo_ref = match[3];
    if (!git_repo_ref && !git_ref) {
      git_ref = 'master';
    } else if (git_repo_ref && !git_ref) {
      git_ref = git_repo_ref;
    }

    // prepare URL
    match = matchFirstRegex(git_repo, /^(\w+?)\/(\w+)$/g);
    if (match) {
      git_repo = `https://github.com/${match[1]}/${match[2]}.git`;
    }

    var git_dest_path = opts['dest-path'];
    if (!git_dest_path) {
      var schema = url.parse(git_repo);
      git_dest_path = path.join("./", path.basename(schema.path).replace(/\.git/, ''));
    }

    return {
      git_url: git_repo,
      git_branch_tag_commit: git_ref,
      git_destination_path: git_dest_path,
      verbose_level: verbose_level
    };
  }

  startProject(command_parse_result) {
    return async(this, function* () {

      var remoteInfo      = yield this.getGitRemoteInfo(
        command_parse_result.git_url,
        command_parse_result.verbose_level);

      var branch_tag_name = command_parse_result.git_branch_tag_commit;
      var _isBranchOrTag  = this._isBranchOrTag(remoteInfo, branch_tag_name);

      var cwd_result;
      if (_isBranchOrTag) {
        // clone to specific branch
        cwd_result = yield this.cloneToFolder(
          command_parse_result.git_url,
          command_parse_result.git_branch_tag_commit,
          command_parse_result.git_destination_path,
          command_parse_result.verbose_level);
      } else {
        // clone to master
        cwd_result = yield this.cloneToFolder(
          command_parse_result.git_url,
          'master',
          command_parse_result.git_destination_path,
          command_parse_result.verbose_level);
        // checkout to specific commit
        yield this.checkoutToCommit(command_parse_result);
      }

      // // check if manifest file exists on destination folder
      // yield this.checkForManifest(command_parse_result.git_destination_path);

      return cwd_result;
    });
  }

  getGitRemoteInfo(git_url, verbose_level) {
    return async(this, function* () {

      this.ok('commands.start.get_project.getting_remote_info', {git_url});

      var git_result_obj = yield this.lsRemote(git_url, verbose_level)
        .catch(this.checkGitError(
          git_url,
          null,
          null));

      var parsed_result = this._parseGitLsRemoteResult(git_result_obj.message);

      return parsed_result;
    });
  }

  _parseGitLsRemoteResult(git_result_message) {
    // https://regex101.com/r/pW4vY1/1
    var maches = matchAllRegex(git_result_message, /^(\w+?)\s(HEAD|refs\/heads\/(.*)|refs\/tags\/(.*))$/gm);
    return maches.map(function (match) {
      if (match[3]) {
        return {
          commit: match[1],
          git_ref: match[3]
        };
      } else if (match[4]) {
        return {
          commit: match[1],
          git_ref: match[4]
        };
      } else if (match[2] === 'HEAD') {
        return {
          commit: match[1],
          git_ref: 'HEAD'
        };
      } else {
        return {
          commit: match[1],
          git_ref: null
        };
      }
    });
  }

  lsRemote(git_url, verbose_level) {
    var git_arguments = [
      'ls-remote',

      git_url
    ];

    return spawnAsync('git', git_arguments, verbose_level);
  }

  checkGitError(git_repo, git_branch_tag_commit, git_destination_path) {
    return function (err) {
      //FIXME: process errors here
      /**/console.log('\n>>---------\n err:\n [' + err.error_code + ']', err.message, '\n>>---------\n');/*-debug-*/
      var original_error = err.message;
      var error_type;

      original_error = fulltrim(original_error);

      // commit not found
      // https://regex101.com/r/bB2fZ9/1
      if (/pathspec ['"]\w+['"] did not match any file/.test(err.message)) {
        error_type = 'commit_not_exist';
      }

      // branch not found
      // https://regex101.com/r/bB2fZ9/2
      if (/Could not find remote branch/.test(err.message)) {
        error_type = 'cloning_not_a_git_repo';
      }

      // destination path exists
      // https://regex101.com/r/bB2fZ9/3
      if (/destination path ['"](.+?)['"] already exists and is not an empty directory/.test(err.message)) {
        error_type = 'folder_already_exists';
      }

      // repo not found
      // https://regex101.com/r/bB2fZ9/4
      if (/Repository not found/.test(err.message)) {
        error_type = 'cloning_error';
      }

      if (/Could not resolve host/.test(err.message)) {
        error_type = 'not_resolve_host';
      }

      if (/repository ['"].*?['"] not found/.test(err.message)) {
        error_type = 'repo_not_found';
      }

      if (/could not create work tree dir/.test(err.message)) {
        error_type = 'cannot_create_folder';
      }

      // /**/console.log('\n%% will show fail \n');/*-debug-*/

      // this.fail('errors.get_project.cloning_not_a_git_repo', {
      //   git_repo,
      //   git_branch_tag_commit,
      //   git_destination_path,
      //   original_error
      // });

      // /**/console.log('\n%% will throw \n');/*-debug-*/

      return promiseReject(new GitCallError(
        error_type,
        git_repo,
        git_branch_tag_commit,
        git_destination_path,
        original_error));
    };
  }

  _isBranchOrTag(git_result_obj_array, branch_tag_name) {
    function _checkBranchOrTag(obj) {
      return obj.git_ref === branch_tag_name;
    }

    var filtered = git_result_obj_array.filter(_checkBranchOrTag);
    return filtered.length > 0;
  }

  cloneToFolder(git_url, git_branch_tag_commit, git_destination_path, verbose_level) {
    return async(this, function* () {
      var dest;
      if (git_destination_path[0] === "/") {
        dest = git_destination_path;
      } else {
        dest = "./" + git_destination_path;
      }

      this.ok('commands.start.get_project.cloning_to_folder', {
        git_url,
        git_branch_tag_commit,
        dest,
      });

      yield this.clone(git_url,
                       git_branch_tag_commit,
                       git_destination_path,
                       verbose_level)
        .catch(this.checkGitError(
          git_url,
          git_branch_tag_commit,
          dest));

      return dest;
    });
  }

  clone(git_url, git_branch_tag_commit, dest_folder, verbose_level) {
    var git_arguments = [
      'clone',
      git_url,
      dest_folder,
      '--branch',
      git_branch_tag_commit,
      '--single-branch',
      '--recursive',
    ];

    return spawnAsync('git', git_arguments, verbose_level);
  }

  checkoutToCommit(parsed_args) {
    this.ok('commands.start.get_project.checkout_to_commit', parsed_args);

    return this.checkoutInFolder(
        parsed_args.git_url,
        parsed_args.git_branch_tag_commit,
        parsed_args.git_destination_path,
        parsed_args.verbose_level)
        .catch(this.checkGitError(
          parsed_args.git_url,
          parsed_args.git_branch_tag_commit,
          parsed_args.git_destination_path));
  }

  checkoutInFolder(git_url, git_branch_tag_commit, dest_folder, verbose_level) {
    var git_arguments = [
      '-C',
      dest_folder,
      'checkout',
      git_branch_tag_commit
    ];

    return spawnAsync('git', git_arguments, verbose_level);
  }
}
