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

  parseCommandOptions(opts) {
    var is_start = opts.start;
    var system_name = opts.system;
    var git_repo = opts['git-repo'];
    var git_ref = opts['git-ref'];

    if (!is_start) {
      return false;
    }

    if (system_name) {
      var valid_system_name = system_name.match(/^[a-zA-Z0-9-]+$/);
      if (!valid_system_name) {
        // invalid system name, must be a git repository link
        git_repo = system_name;
      } else {
        // must be a system name, continue to scale process
        return {
          git_url: null,
          git_branch_tag_commit: null,
          git_destination_path: null,
        };
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
    // var git_clone = `git clone ${git_repo} --branch ${git_ref}
    // --single-branch --depth 1 ${git_dest_path}`;

    var parse_result = {
      git_url: git_repo,
      git_branch_tag_commit: git_ref,
      git_destination_path: git_dest_path,
    };

    return parse_result;
  }

  run(url_target, params) {
    return async(this, function* () {
      try {
        var dest, target;

        var isUrlRegex = /\b(?:(?:https?|ftp|file|ircs?):\/\/|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.;]*[A-Z0-9+&@#/%=~_|$]/gmi;
        if (isUrlRegex.test(url_target)) {
          target = url_target;
        } else {
          target = "https://github.com/" + url_target;
        }

        // Target
        if (!params.path) {
          var schema = url.parse(target);
          dest = path.join("./", path.basename(schema.path));
        } else {
          dest = params.path;
        }

        this.ok(`Cloning ${target} to ${dest[0] == "/" ? dest : "./" + dest } ...`);
        yield this.clone(target, dest);

        return dest;
      } catch (e) {
        console.error(e.stack);
        throw e;
      }
    });
  }

  clone(url, dest) {
    return ninvoke(lazy.Repository, "clone", url, dest);
  }
}
