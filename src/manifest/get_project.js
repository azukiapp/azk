import { path, lazy_require } from 'azk';
import { async, ninvoke } from 'azk/utils/promises';
import { UIProxy } from 'azk/cli/ui';

var url  = require('url');
var lazy = lazy_require({
  Repository: ['git-cli'],
});

export class GetProject extends UIProxy {
  static valid(url) {
    var isValid = /\//;
    return isValid.test(url);
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
