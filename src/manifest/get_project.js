import { path, lazy_require } from 'azk';
import { async, ninvoke } from 'azk/utils/promises';
import { UIProxy } from 'azk/cli/ui';
import { matchFirstRegex } from 'azk/utils/regex_helper';

var url  = require('url');
var lazy = lazy_require({
  Repository: ['git-cli'],
});

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
    };
  }

  run(parsed_args) {
    return async(this, function* () {
      try {
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
                         parsed_args.git_destination_path);
        return dest;

      } catch (e) {
        console.error(e.stack);
        throw e;
      }
    });
  }

  clone(git_url, git_branch_tag_commit, dest_folder) {
    return ninvoke(lazy.Repository,
      'clone',
      git_url,
      dest_folder,
      {
        branch: git_branch_tag_commit,
        'single-branch': true,
        'recursive': true,
        //'depth': 1,
      });
  }
}
