import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "elixir";
    this.rule_name = "elixir";

    // Suggest a docker image
    // http://images.azk.io/#/elixir
    this.version_rules = {
      // 'elixir0' : '>0 <1',
    };
  }

  relevantsFiles() {
    return ['mix.exs'];
  }

  getVersion(content) {
    // https://regex101.com/r/jQ6eE8/1
    var regex = /elixir[\s]*\:[\s]*\"(.*)\"/gm;
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
