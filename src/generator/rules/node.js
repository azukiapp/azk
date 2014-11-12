import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getVersion = function(content) {

  // http://regex101.com/r/wR0kX9/2
  // { "engine": "node >= 0.4.1", }
  var versionRegex = /^\s*['"]engine['"]:\s*['"]node.*(\d+\.\d+\.\d+)['"]/gm;
  var capture = versionRegex.exec(content);
  var extractedVersion = capture && capture.length >= 1 && capture[1];

  if (!extractedVersion) {
    // http://regex101.com/r/wR0kX9/3
    // "engines":{
    //   "node": ">=0.10.3 <0.12"
    // },
    versionRegex = /['"]node['"]\s*:.+?.*?(\d+\.[\dx]+(?:\.[\dx]+)?)/gm;
    capture = versionRegex.exec(content);
    extractedVersion = capture && capture.length >= 1 && capture[1];
  }

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
    this.type = 'runtime';
  }

  relevantsFiles() {
    return ['package.json'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'runtime',
      name    : 'node',
      ruleName: 'node010'
    };

    var nodeVersion = getVersion(content);
    evidence.version = nodeVersion;

    // cant find node version, will use default node:latest
    if(!nodeVersion){
      return evidence;
    }

    // Suggest a docker image
    // https://registry.hub.docker.com/u/library/node/
    var versionRules = {
      'node010': '<0.8.0 || >=0.10.0 <0.11.0',
      'node08' : '>=0.8.0 <0.10.0',
      'node011': '>=0.11.0',
    };

    evidence.ruleName = _.findKey(versionRules, (value) => {
      return semver.satisfies(nodeVersion, value);
    });

    return evidence;
  }

}
