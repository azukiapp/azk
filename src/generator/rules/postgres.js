import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "database";
    this.name      = "postgres";
    this.rule_name = "postgres-9.3";

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
    var regex = /^\s*gem ['"]pg['"]/gm;
    return regex.test(content);
  }
}
