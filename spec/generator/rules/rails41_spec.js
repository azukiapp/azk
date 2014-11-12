import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/rails41';

describe('Azk generators Rails 4.1 rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an evidence object', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'gem \'rails\', \'4.1.6\'',
      'gem \'mysql2\', :git => "git://github.com/brianmario/mysql2"',
      'gem \'pg\', \'~> 0.17.1\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);

    h.expect(evidence).to.have.deep.property('fullpath', gemfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'framework');
    h.expect(evidence).to.have.deep.property('name'    , 'rails');
    h.expect(evidence).to.have.deep.property('ruleName', 'rails41');
    h.expect(evidence.replaces).to.include('ruby');
    h.expect(evidence.replaces).to.include('node');
    h.expect(evidence).to.have.deep.property('version' , '4.1.6');
  });

});
