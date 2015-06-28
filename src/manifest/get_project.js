import { path } from 'azk';
import { async } from 'azk/utils/promises';
import { UIProxy } from 'azk/cli/ui';
import { matchFirstRegex, matchAllRegex } from 'azk/utils/regex_helper';
import { spawnAsync } from 'azk/utils/spawn_helper';

var url  = require('url');

export class GetProject extends UIProxy {
  static valid(url) {
    var isValid = /\//;
    return isValid.test(url);
  }

  static parseCommandOptions(opts) {
    var is_start = opts.start;
    var system_name = opts.system;
    var git_repo = opts['git-repo'];
    var git_ref = opts['git-ref'];
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

  getGitRemoteInfo(parsed_args) {
    return async(this, function* () {

      this.ok([
        `Getting ${parsed_args.git_url}`,
        ` remote info ...`,
      ].join(''));

      var git_result_obj = yield this.lsRemote(parsed_args.git_url, parsed_args.verbose_level)
                                  .catch(this.checkGitError);

      var parsed_result = this._parseGitLsRemoteResult(git_result_obj.message);

      return parsed_result;
    });
  }

  _parseGitLsRemoteResult(git_result_message) {
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

    // http://stackoverflow.com/questions/18002585/trying-to-redirect-git-gc-output/18004259#18004259
    return spawnAsync('git', git_arguments, verbose_level);
  }

  checkGitError(err) {
    //FIXME: process errors here
    /**/console.log('\n>>---------\n err:\n [' + err.error_code + ']', err.message, '\n>>---------\n');/*-debug-*/
  }

  cloneToFolder(parsed_args) {
    return async(this, function* () {
      var dest;
      if (parsed_args.git_destination_path[0] === "/") {
        dest = parsed_args.git_destination_path;
      } else {
        dest = "./" + parsed_args.git_destination_path;
      }

      this.ok([
        `Cloning ${parsed_args.git_url}#${parsed_args.git_branch_tag_commit}`,
        ` to ${dest} ...`,
      ].join(''));

      yield this.clone(parsed_args.git_url,
                       parsed_args.git_branch_tag_commit,
                       parsed_args.git_destination_path,
                       parsed_args.verbose_level).catch(this.checkGitError);
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

    // http://stackoverflow.com/questions/18002585/trying-to-redirect-git-gc-output/18004259#18004259
    return spawnAsync('git', git_arguments, verbose_level);
  }

}
