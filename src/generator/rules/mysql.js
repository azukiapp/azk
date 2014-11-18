import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

var getVersion = function(content) {
  // TODO: check and return gem version (maybe usefull)
  var mysqlRegex = /^\s*gem ['"]mysql2?['"]/gm;
  return mysqlRegex.test(content);
};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = 'database';
  }

  relevantsFiles () {
    return ['Gemfile'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'database',
      name    : 'mysql',
      ruleName: 'mysql56'
    };

    var versions = getVersion(content);

    if(versions){
      return evidence;
    }
    else{
      return null;
    }
  }

}

