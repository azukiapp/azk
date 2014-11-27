import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/php_composer';

describe('Azk generators PHP with composer rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an php with composer evidence object', () => {
    var packageJsonfilePath = '/tmp/azk-test-composer/composer.json';
    var packageJsonContent  = [
      '{',
      '    "name": "azuki/php",',
      '    "description": "Sample application",',
      '    "authors": [',
      '        {',
      '            "name": "Azuki",',
      '            "email": "support@azukiapp.com"',
      '        }',
      '    ],',
      '    "require": {',
      '        "php": "~5.6.3"',
      '    }',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);

    h.expect(evidence).to.have.deep.property('fullpath', packageJsonfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'phpcomposer');
    h.expect(evidence).to.have.deep.property('ruleName', 'php56');
    h.expect(evidence).to.have.deep.property('version' , '5.6.3');
    h.expect(evidence).to.have.deep.property('replaces[0]', 'php');
    h.expect(evidence).to.have.deep.property('replaces[1]', 'node');
  });

  it('should get latest php with composer version when do not found engine', () => {
    var packageJsonfilePath = '/tmp/azk-test-composer/composer.json';
    var packageJsonContent = [
      '{',
      '    "name": "azuki/php",',
      '    "description": "Sample application",',
      '    "authors": [',
      '        {',
      '            "name": "Azuki",',
      '            "email": "support@azukiapp.com"',
      '        }',
      '    ],',
      '    "require": {}',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'php56');
    h.expect(evidence).to.have.deep.property('version' , null);
  });

  it('should get latest php with composer version when version is too low', () => {
    var packageJsonfilePath = '/tmp/azk-test-composer/composer.json';
    var packageJsonContent  = [
      '{',
      '    "name": "azuki/php",',
      '    "description": "Sample application",',
      '    "authors": [',
      '        {',
      '            "name": "Azuki",',
      '            "email": "support@azukiapp.com"',
      '        }',
      '    ],',
      '    "require": {',
      '        "php": "~5.5.9"',
      '    }',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);

    h.expect(evidence).to.have.deep.property('fullpath', packageJsonfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'phpcomposer');
    h.expect(evidence).to.have.deep.property('ruleName', 'php55');
    h.expect(evidence).to.have.deep.property('version' , '5.5.9');
  });

});
