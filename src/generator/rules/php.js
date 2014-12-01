import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = 'runtime';
  }

  relevantsFiles() {
    return ['index.php'];
  }

  getEvidence(path, content) {
    var evidence = {
      fullpath: path,
      ruleType: 'runtime',
      name    : 'php',
      ruleName: 'php'
    };

    return evidence;
  }

}
