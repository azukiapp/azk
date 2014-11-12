import { _ } from 'azk';
import { BaseRule } from 'azk/generator/rules';
var semver = require('semver');

// i.e.: ruby "1.8.7", :engine => "jruby", :engine_version => "1.6.7"
var getVersion = function(content) {

  var rubyVersion, rubyEngine, rubyEngineVersion;

  // Ruby Version
  // http://regex101.com/r/rO8iA0/3
  var rubyVersionRegex = /\s*\bruby ['"]?(\d+\.\d+\.\d+)['"]?/gm;
  var captureRubyVersionRegex = rubyVersionRegex.exec(content);
  var extractedRubyVersionRegex = captureRubyVersionRegex && captureRubyVersionRegex.length >= 1 && captureRubyVersionRegex[1];
  if (extractedRubyVersionRegex) {
    rubyVersion = semver.clean(extractedRubyVersionRegex);
  }

  // Engine
  // http://regex101.com/r/rO8iA0/4
  var engineRegex1 = /\s*:engine\s*\=\>\s*['"](\w+)['"]/gm;
  var captureEngineRegex1 = engineRegex1.exec(content);
  var extractedEngineRegex1 = captureEngineRegex1 && captureEngineRegex1.length >= 1 && captureEngineRegex1[1];
  if (extractedEngineRegex1) {
    rubyEngine = extractedEngineRegex1;
  }
  // http://regex101.com/r/rO8iA0/5
  var engineRegex2 = /\s*\bruby ['"]?\d+\.\d+\.\d+['"]?\s*\((\w+)/gm;
  var captureEngineRegex2 = engineRegex2.exec(content);
  var extractedEngineRegex2 = captureEngineRegex2 && captureEngineRegex2.length >= 1 && captureEngineRegex2[1];
  if (extractedEngineRegex2) {
    rubyEngine = extractedEngineRegex2;
  }

  // Engine Version
  // http://regex101.com/r/rO8iA0/2
  var engineVersionRegex1 = /\s*:engine_version\s*\=\>\s*['"](\d+\.\d+\.\d+)['"]/gm;
  var captureEngineVersionRegex1 = engineVersionRegex1.exec(content);
  var extractedEngineVersionRegex1 = captureEngineVersionRegex1 && captureEngineVersionRegex1.length >= 1 && captureEngineVersionRegex1[1];
  if (extractedEngineVersionRegex1) {
    rubyEngineVersion = semver.clean(extractedEngineVersionRegex1);
  }
  // http://regex101.com/r/rO8iA0/6
  var engineVersionRegex2 = /\s*\bruby ['"]?\d+\.\d+\.\d+['"]?\s*\(\w+\s+(\d+\.\d+\.\d+)/gm;
  var captureEngineVersionRegex2 = engineVersionRegex2.exec(content);
  var extractedEngineVersionRegex2 = captureEngineVersionRegex2 && captureEngineVersionRegex2.length >= 1 && captureEngineVersionRegex2[1];
  if (extractedEngineVersionRegex2) {
    rubyEngineVersion = semver.clean(extractedEngineVersionRegex2);
  }

  if (rubyVersion) {
    return {
      rubyVersion: rubyVersion,
      rubyEngine: rubyEngine,
      rubyEngineVersion: rubyEngineVersion
   };
  }
  else {
    return null;
  }

};

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = "runtime";
  }

  relevantsFiles () {
    return ['Gemfile'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'runtime',
      name    : 'ruby',
      ruleName: 'ruby21'
    };

    var versions = getVersion(content);
    evidence.version = versions && versions.rubyVersion;

    // cant find node version, will use default node:latest
    if(versions === null){
      return evidence;
    }

    // JRuby
    // https://registry.hub.docker.com/u/library/jruby/
    if (versions.rubyEngine === 'jruby'){
      evidence.ruleName = 'jruby17';
      return evidence;
    }

    // MRI
    var versionRules = {
      'ruby19': '>=1.9.3 <2.0.0',
      'ruby20': '>=2.0.0 <2.1.0',
      'ruby21': '<1.9.3 || >=2.1.0',
    };

    evidence.ruleName = _.findKey(versionRules, (value) => {
      return semver.satisfies(evidence.version, value);
    });

    return evidence;
  }

}

