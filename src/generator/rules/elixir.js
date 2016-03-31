import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
import { Versions } from 'azk/utils';
import { last } from 'lodash/array';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "elixir";
    this.rule_name = "elixir-1.2"; // default version
    this.replaces  = ['node'];

    // Suggest a docker image
    // http://images.azk.io/#/elixir
    this.version_rules = {
      'elixir-1.2' : '>=1.2',
      'elixir-1.1' : '>=1.1 <1.2',
      'elixir-1.0' : '<1.1',
    };
  }

  relevantsFiles() {
    return ['mix.exs'];
  }

  getVersion(content) {
    // https://regex101.com/r/jQ6eE8/4
    var regex = /elixir[\s]*\:[\s]*\"(?:[~> ]*)?([0-9.]+)(?:(?:[or ~>]*)?([0-9.]+))?(?:.*)?\".*/gm;
    var versions = Versions.match(regex, content);
    return versions && last(versions);
  }
}
