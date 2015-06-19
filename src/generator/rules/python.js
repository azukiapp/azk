import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "python";
    this.rule_name = "python";

    // Suggest a docker image
    // http://images.azk.io/#/elixir
    this.version_rules = {
      'python-2.7': '>=2.7.8 <3.4.2',
      'python-3.4': '<2.7.8 || >=3.4.2',
    };
  }

  relevantsFiles () {
    return ['runtime.txt'];
  }

  getVersion(content) {
    var pythonVersion = null;

    // Pyhton Version
    // http://regex101.com/r/hH2uY1/1
    var pythonVersionRegex = /^python-(\d+\.\d+\.\d+)/gm;
    var capturePyhtonVersionRegex = pythonVersionRegex.exec(content);
    var extractedPyhtonVersionRegex = capturePyhtonVersionRegex &&
                                      capturePyhtonVersionRegex.length >= 1 &&
                                      capturePyhtonVersionRegex[1];
    if (extractedPyhtonVersionRegex) {
      pythonVersion = this.semver.clean(extractedPyhtonVersionRegex);
    }

    return pythonVersion;
  }
}
