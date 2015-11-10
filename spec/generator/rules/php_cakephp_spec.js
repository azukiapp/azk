import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/php_cakephp';

describe('Azk generators PHP with CakePHP rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an php with cakephp evidence object', () => {
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
      '        "php": ">=5.4.16",',
      '        "cakephp/cakephp": "3.*"',
      '    }',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);

    h.expect(evidence).to.have.deep.property('fullpath', packageJsonfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'framework');
    h.expect(evidence).to.have.deep.property('name'    , 'php_cakephp');
    h.expect(evidence).to.have.deep.property('ruleName', 'php_cakephp');
    h.expect(evidence).to.have.deep.property('framework' , '3.1');
    h.expect(evidence.replaces).to.include('php');
    h.expect(evidence.replaces).to.include('node');
    h.expect(evidence.replaces).to.include('php_composer');
  });

  it('should get latest php with cakephp version when do not found engine', () => {
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
      '    "require": {',
      '        "php": ">=5.4.16",',
      '        "cakephp/cakephp": "3.*"',
      '    }',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'php_cakephp');
    h.expect(evidence).to.have.deep.property('framework' , '3.1');
  });
});
