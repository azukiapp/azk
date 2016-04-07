import { Rule as ElixirRule } from 'azk/generator/rules/elixir';
import { Versions } from 'azk/utils';
import { last } from 'lodash/array';

export class Rule extends ElixirRule {
  constructor(ui) {
    super(ui);
    this.type      = 'framework';
    this.name      = 'elixir_phoenix';
    this.rule_name = 'elixir_phoenix';
    this.replaces  = ['elixir', 'node'];
    this.version_rules = {};
  }

  getFrameworkVersion(content) {
    // https://regex101.com/r/yG4cG2/2
    var regex = /\:phoenix[\s]*\,[\s]*\"(?:[~> ]*)?([0-9.]+)(?:(?:[or ~>]*)?([0-9.]+))?(?:.*)?\".*/gm;
    var versions = Versions.match(regex, content);
    return versions && last(versions);
  }
}
