import { _ } from 'azk';
import { Rule as ElixirRule } from 'azk/generator/rules/elixir';

export class Rule extends ElixirRule {
  constructor(ui) {
    super(ui);
    this.type      = 'framework';
    this.name      = 'elixir';
    this.rule_name = 'elixir_phoenix';
    this.replaces  = ['elixir', 'node'];
  }

  getFrameworkVersion(content) {
    // https://regex101.com/r/yG4cG2/1
    var regex = /\:phoenix[\s]*\,[\s]*\"(.*)\"/gm;
    var version = regex.exec(content);
    version = version && version.length >= 1 && version[1];
    version = (version || '').replace(/[~> ]/gm, '');

    if (_.isEmpty(version)) { return null; }

    // force valid format: eg: 1.0 => 1.0.0
    var split = version.split('.');
    _.map(_.range(3), (i) => {
      split[i] = split[i] || '0';
    });
    return this.semver.clean(split.join('.'));
  }
}
