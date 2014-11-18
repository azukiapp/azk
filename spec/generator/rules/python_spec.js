import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/python';

describe('Azk generators Pyhton rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an evidence object', () => {
    var runtimePath = '/tmp/pythonProject/runtime.txt';
    var runtimeContent = [
      'python-3.4.2',
      ''
    ].join('\n');

    var evidence = rule.getEvidence(runtimePath, runtimeContent);

    h.expect(evidence).to.have.deep.property('fullpath', runtimePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'python');
    h.expect(evidence).to.have.deep.property('ruleName', 'python34');
    h.expect(evidence).to.have.deep.property('version' , '3.4.2');

  });

  it('should get latest python version when do not found engine', () => {
    var runtimePath = '/tmp/pythonProject/runtime.txt';
    var runtimeContent = [
      'python-3.4.2'
    ].join('\n');

    var evidence = rule.getEvidence(runtimePath, runtimeContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'python34');
  });

  it('should get latest python version when version is too low', () => {
    var runtimePath = '/tmp/pythonProject/runtime.txt';
    var runtimeContent = [
      'python-2.7.7'
    ].join('\n');

    var evidence = rule.getEvidence(runtimePath, runtimeContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'python34');
  });

  it('should get 2.7 python version when detected', () => {
    var runtimePath = '/tmp/pythonProject/runtime.txt';
    var runtimeContent = [
      'python-2.7.8'
    ].join('\n');

    var evidence = rule.getEvidence(runtimePath, runtimeContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'python27');
  });

});
