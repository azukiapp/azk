import { BaseRule } from 'azk/generator/rules';
import { path } from 'azk';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "database";
    this.name      = "mysql";
    this.rule_name = "mysql";

    // Suggest a docker image
    // http://images.azk.io/#/mysql
    this.version_rules = {
    };
  }

  relevantsFiles() {
    return ['Gemfile', 'wp-login.php'];
  }

  checkDatabase(content, full_path) {
    var filename = path.basename(full_path);
    switch (filename) {
      case "wp-login.php":
        return true;
      default:
        // TODO: check and return gem version (maybe usefull)
        var regex = /^\s*gem ['"]mysql2?['"]/gm;
        return regex.test(content);
    }
  }
}
