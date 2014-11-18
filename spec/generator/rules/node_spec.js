import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/node';

describe('Azk generators Node.js rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an node evidence object', () => {
    var packageJsonfilePath = '/tmp/azk-test-30501680wvr4/front/package.json';
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "engine": "node >= 0.4.1",',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>"',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);

    h.expect(evidence).to.have.deep.property('fullpath', packageJsonfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'node');
    h.expect(evidence).to.have.deep.property('ruleName', 'node010');
    h.expect(evidence).to.have.deep.property('version' , '0.4.1');
  });

  it('should get latest node version when do not found engine', () => {
    var packageJsonfilePath = '/tmp/azk-test-30501680wvr4/front/package.json';
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>"',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'node010');
  });

  it('should get latest node version when version is too low', () => {
    var packageJsonfilePath = '/tmp/azk-test-30501680wvr4/front/package.json';
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "engine": "node >= 0.4.1",',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>"',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'node010');
  });

  it('should get 0.8 version when required', () => {
    var packageJsonfilePath = '/tmp/azk-test-30501680wvr4/front/package.json';
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "engines": {',
      '    "node": "v0.8.0"',
      '  },',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>"',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'node08');
  });

  it('should get latest version when version is v0.10', () => {
    var packageJsonfilePath = '/tmp/azk-test-30501680wvr4/front/package.json';
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "engines": {',
      '    "node": "v0.10.0"',
      '  },',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>"',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'node010');
  });

  it('should get 0.11 version when version is >= v0.11', () => {
    var packageJsonfilePath = '/tmp/azk-test-30501680wvr4/front/package.json';
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "engines": {',
      '    "node": "v0.11.0"',
      '  },',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>"',
      '}',
    ].join('\n');

    var evidence = rule.getEvidence(packageJsonfilePath, packageJsonContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'node011');
  });

});
