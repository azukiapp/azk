import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getLaravelVersion = function(content) {

  // http://regex101.com/r/fP6gF2/3
  // "require":{
  //   "laravel/framework": "4.2.*"
  // },
  var laravelVersionRegex = /['"]laravel\/framework['"]\s*:.+?.*?(\d+\.[\dx]+(?:\.[\dx*]+)?)/gm;
  var capture = laravelVersionRegex.exec(content);
  var extractedVersion = capture && capture.length >= 1 && capture[1].replace(/\*/, '0');

  if (extractedVersion) {
    return semver.clean(extractedVersion);
  }
  else{
    return null;
  }

};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = 'framework';
  }

  relevantsFiles() {
    return ['composer.json'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'framework',
      name    : 'phplaravel',
      ruleName: 'phplaravel',
      replaces: ['php', 'node', 'phpcomposer']
    };

    var laravelVersion = getLaravelVersion(content);
    evidence.version = laravelVersion;

    return evidence;
  }

}
