import { Rule as RubyRule } from 'azk/generator/rules/ruby';

export class Rule extends RubyRule {
  constructor(ui) {
    super(ui);
    this.type      = 'framework';
    this.name      = "ruby_on_rails";
    this.rule_name = "ruby_on_rails";
    this.replaces  = ['ruby', 'node'];
    this.version_rules = {};
  }

  relevantsFiles () {
    return ['Gemfile'];
  }

  getFrameworkVersion(content) {
    // http://regex101.com/r/qP4gG7/2
    // version will be on the first group
    var regex   = /^\s*gem ['"]rails['"],\s+['"](.+?)['"]\s*$/gm;
    var match   = regex.exec(content);
    var version = match && match.length >= 1 && match[1];
    return version && this.semver.clean(version);
  }
}
