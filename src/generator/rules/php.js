import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "php";
    this.rule_name = "php";
  }

  relevantsFiles () {
    return ['index.php'];
  }
}
