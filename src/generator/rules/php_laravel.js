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
     parsedJson.require['laravel/framework']) {
    // remove garbage
    var versionCleaned = parsedJson.require['laravel/framework'];
    // strip non valid chars
    versionCleaned = versionCleaned.replace(/[^*.\d]/g, "");
    // * -> 0
    versionCleaned = versionCleaned.replace(/\*/g, "0");
    return semver.clean(versionCleaned);
  }

  return null;
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

    var laravelVersion = getVersion(path, content);
    evidence.version = laravelVersion;

    return evidence;
  }

}
