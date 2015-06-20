import { BaseRule } from 'azk/generator/rules';
import { _ } from 'azk';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "ruby";
    this.rule_name = "ruby";

    // Suggest a docker image
    // http://images.azk.io/#/elixir
    this.version_rules = {
      'ruby-1.9': '>=1.9.3 <2.0.0',
      'ruby-2.0': '>=2.0.0 <2.1.0',
      'ruby-2.1': '>=2.1.0 <2.2.0',
      'ruby-2.2': '<1.9.3 || >=2.2.0',
    };
  }

  relevantsFiles () {
    return ['Gemfile'];
  }

  getVersion(content) {
    // Ruby Version
    // http://regex101.com/r/rO8iA0/3
    var regex = /\s*\bruby ['"]?(\d+\.\d+\.\d+)['"]?/gm;
    var match   = regex.exec(content);
    var version = match && match.length >= 1 && match[1];
    return version && this.semver.clean(version);
  }

  getEngineVersion(content) {
    // Engine and version
    var regexs = [
      {
        // http://regex101.com/r/rO8iA0/4
        engine: /\s*:engine\s*\=\>\s*['"](\w+)['"]/gm,
        // http://regex101.com/r/rO8iA0/2
        version: /\s*:engine_version\s*\=\>\s*['"](\d+\.\d+\.\d+)['"]/gm,
      }, {
        // http://regex101.com/r/rO8iA0/5
        engine: /\s*\bruby ['"]?\d+\.\d+\.\d+['"]?\s*\((\w+)/gm,
        // http://regex101.com/r/rO8iA0/6
        version: /\s*\bruby ['"]?\d+\.\d+\.\d+['"]?\s*\(\w+\s+(\d+\.\d+\.\d+)/gm,
      }
    ];

    var engines = [];
    _.map(regexs, (regex) => {
      // engine
      var engine_match = regex.engine.exec(content);
      var name         = engine_match && engine_match.length >= 1 && engine_match[1];
      if (name) {
        // version
        // var version_match = regex.version.exec(content);
        // var version       = version_match && version_match.length >= 1 && version_match[1];
        // version = version && this.semver.clean(version);
        // engines.push({ name, version });
        engines.push(name);
      }
    });

    return _.head(engines);
  }

  getEvidence(path, content) {
    var evidence = super.getEvidence(path, content);
    var engine = this.getEngineVersion(content);
    if (engine === 'jruby') {
      evidence.ruleName = `${engine}-1.7`;
    }
    return evidence;
  }
}
