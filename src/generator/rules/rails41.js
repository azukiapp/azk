import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getRailsVersion = function(content) {

  // http://regex101.com/r/qP4gG7/2
  // version will be on the first group
  var gemRailsRegex = /^\s*gem ['"]rails['"],\s+['"](.+?)['"]\s*$/gm;

  var capture = gemRailsRegex.exec(content);
  var railsVersion = capture && capture.length >= 1 && capture[1];
  if (!railsVersion) {
    return false;
  }
  return semver.clean(railsVersion);
};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = 'framework';
  }

  relevantsFiles () {
    return ['Gemfile'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'framework',
      name    : 'rails',
      ruleName: 'rails41',
      replaces: ['ruby', 'node']
    };

    var railsVersion = getRailsVersion(content);
    if (!railsVersion) {
      return null;
    }

    var isRails41 = semver.gt(railsVersion, '4.1.0') &&
                    semver.lt(railsVersion, '5.0.0');

    if (!isRails41) {
      return null;
    }

    evidence.version = railsVersion;

    return evidence;
  }

}
