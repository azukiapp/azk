import { Rule as BaseRule } from 'azk/generator/rules/php';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.name      = "wordpress";
    this.rule_name = this.name;
    this.replaces  = ['php'];
  }
}
