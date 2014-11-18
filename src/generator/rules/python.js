import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getVersion = function(content) {

  var pythonVersion = null;

  // Pyhton Version
  // http://regex101.com/r/hH2uY1/1
  var pythonVersionRegex = /^python-(\d+\.\d+\.\d+)/gm;
  var capturePyhtonVersionRegex = pythonVersionRegex.exec(content);
  var extractedPyhtonVersionRegex = capturePyhtonVersionRegex && capturePyhtonVersionRegex.length >= 1 && capturePyhtonVersionRegex[1];
  if (extractedPyhtonVersionRegex) {
    pythonVersion = semver.clean(extractedPyhtonVersionRegex);
  }

  return pythonVersion;
};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = "runtime";
  }

  relevantsFiles () {
    return ['runtime.txt'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'runtime',
      name    : 'python',
      ruleName: 'python34'
    };

    var pythonVersion = getVersion(content);
    evidence.version = pythonVersion;

    // cant find version, will use latest
    if(pythonVersion === null){
      return evidence;
    }

    // MRI
    var versionRules = {
      'python27': '>=2.7.8 <3.4.2',
      'python34': '<2.7.8 || >=3.4.2',
    };

    evidence.ruleName = _.findKey(versionRules, (value) => {
      return semver.satisfies(evidence.version, value);
    });

    return evidence;
  }

}

