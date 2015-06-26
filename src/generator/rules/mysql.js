import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "database";
    this.name      = "mysql";
    this.rule_name = "mysql-5.6";

    // Suggest a docker image
    // http://images.azk.io/#/mysql
    this.version_rules = {
    };
  }

  relevantsFiles() {
    return ['Gemfile'];
  }

  checkDatabase(content) {
    // TODO: check and return gem version (maybe usefull)
    var regex = /^\s*gem ['"]mysql2?['"]/gm;
    return regex.test(content);
  }
}
