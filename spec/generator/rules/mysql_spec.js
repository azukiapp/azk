import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/mysql';

describe('Azk generators MySql rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should find a mysql database', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'gem \'rails\', \'4.1.6\'',
      'gem \'mysql2\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.property('name', 'mysql');
  });

});
