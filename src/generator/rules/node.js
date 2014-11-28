import { _, log } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getVersion = function(path, content) {
  var parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch (err) {
    log.error('JSON.parse error [', path, ']', err.stack || err);
  }

  if(parsedJson &&
     parsedJson.engine) {
    // remove garbage
    var versionCleaned = parsedJson.engine.replace(/[^\d\.]/g, "");
    return semver.clean(versionCleaned);
  }

  if(parsedJson &&
     parsedJson.engines &&
     parsedJson.engines.node) {
    return semver.clean(parsedJson.engines.node);
  }

  return null;
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

    var nodeVersion = getVersion(path, content);
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
