import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/postgres';

describe('Azk generators Postgres rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should find a pg database', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'gem \'rails\', \'4.1.6\'',
      'gem \'pg\', \'~> 0.17.1\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.property('name', 'postgres');
  });

});
