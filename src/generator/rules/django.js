import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getDjangoVersion = function(content) {

  // http://regex101.com/r/kI9wQ3/1
  var gemDjangoRegex = /^\s*Django==(\d+\.\d+(\.\d+)?)\s*$/gm;

  var capture = gemDjangoRegex.exec(content);
  var djangoVersion = capture && capture.length >= 1 && capture[1];
  if (!djangoVersion) {
    return false;
  }
  var djangoVersionLastPart = capture && capture.length >= 2 && capture[2];
  if (!djangoVersionLastPart) {
    djangoVersion = djangoVersion + '.0';
  }

  return semver.clean(djangoVersion);
};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = 'framework';
  }

  relevantsFiles () {
    return ['requirements.txt'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'framework',
      name    : 'django',
      ruleName: 'django',
      replaces: ['python']
    };

    var djangoVersion = getDjangoVersion(content);
    evidence.version = djangoVersion;

    if(!djangoVersion) {
      return null;
    }

    /*
      What Python version can I use with Django?
      (https://docs.djangoproject.com/en/dev/faq/install/)

      Django version       Python versions
      1.4                  2.5, 2.6, 2.7
      1.5                  2.6, 2.7 and 3.2, 3.3 (experimental)
      1.6                  2.6, 2.7 and 3.2, 3.3
      1.7, 1.8             2.7 and 3.2, 3.3, 3.4
    */
    var versionRules = {
      'djangoPython27': '<1.7.0',
      'djangoPython34': '>=1.7.0',
    };

    evidence.ruleName = _.findKey(versionRules, (value) => {
      return semver.satisfies(evidence.version, value);
    });

    return evidence;
  }

}
