import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/php_laravel';

describe('Azk generators PHP with laravel rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an php with laravel evidence object', () => {
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
      '        "php": "~5.6.3",',
      '        "laravel/framework": "4.2.*"',
      '    }',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);

    h.expect(evidence).to.have.deep.property('fullpath', packageJsonfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'framework');
    h.expect(evidence).to.have.deep.property('name'    , 'php_laravel');
    h.expect(evidence).to.have.deep.property('ruleName', 'php_laravel');
    h.expect(evidence).to.have.deep.property('framework' , '4.2.0');
    h.expect(evidence.replaces).to.include('php');
    h.expect(evidence.replaces).to.include('node');
    h.expect(evidence.replaces).to.include('php_composer');
  });

  it('should get latest php with laravel version when do not found engine', () => {
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
      '        "php": "~5.6.3",',
      '        "laravel/framework": "4.1.*"',
      '    }',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'php_laravel');
    h.expect(evidence).to.have.deep.property('framework' , '4.1.0');
  });
});
