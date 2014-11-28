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
     parsedJson.require &&
     parsedJson.require.php) {
    // remove garbage
    var versionCleaned = parsedJson.require.php.replace(/[^\d\.\*]/g, "");
    return semver.clean(versionCleaned);
  }

  return null;
};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = 'runtime';
  }

  relevantsFiles() {
    return ['composer.json'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'runtime',
      name    : 'phpcomposer',
      ruleName: 'php56',
      replaces: ['php', 'node']
    };

    var phpVersion = getVersion(path, content);
    evidence.version = phpVersion;

    // cant find php version, will use default php v5.5.9
    if(!phpVersion){
      return evidence;
    }

    // Suggest a docker image
    // https://registry.hub.docker.com/u/library/node/
    var versionRules = {
      'php55' : '>=5.5.9 <5.6.3',
      'php56' : '<5.5.9 || >=5.6.3'
    };

    evidence.ruleName = _.findKey(versionRules, (value) => {
      return semver.satisfies(phpVersion, value);
    });

    return evidence;
  }

}
