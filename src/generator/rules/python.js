import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "python";
    this.rule_name = "python";

    // Suggest a docker image
    // http://images.azk.io/#/elixir
    this.version_rules = {
      'python-2.7': '>=2.7.8 <3.4.2',
      'python-3.4': '<2.7.8 || >=3.4.2',
    };
  }

  relevantsFiles () {
    return ['runtime.txt'];
  }

  getVersion(content) {
    // Pyhton Version
    // http://regex101.com/r/hH2uY1/1
    var regex   = /^python-(\d+\.\d+\.\d+)/gm;
    var match   = regex.exec(content);
    var version = match && match.length >= 1 && match[1];
    return version && this.semver.clean(version);
  }
}
