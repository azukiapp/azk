import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/php';

describe('Azk generators PHP rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an php evidence object', () => {
    var indexFilePath = '/tmp/azk-test-composer/index.php';
    var indexFileContent = [
      '<?php',
      'phpinfo();',
      '?>',
    ].join('\n');

    var evidence = rule.getEvidence(indexFilePath, indexFileContent);

    h.expect(evidence).to.have.deep.property('fullpath', indexFilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'php');
    h.expect(evidence).to.have.deep.property('ruleName', 'php');
  });
});
