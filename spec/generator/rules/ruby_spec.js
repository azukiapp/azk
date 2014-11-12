import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/ruby';

describe('Azk generators Ruby rule', function() {
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
      'ruby \'1.9.3\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);

    h.expect(evidence).to.have.deep.property('fullpath', gemfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'ruby');
    h.expect(evidence).to.have.deep.property('ruleName', 'ruby19');
    h.expect(evidence).to.have.deep.property('version' , '1.9.3');

  });

  it('should get latest ruby version when do not found engine', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'ruby21');
  });

  it('should get latest ruby version when version is too low', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'ruby \'1.8.1\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'ruby21');
  });

  it('should get 1.9 ruby version when detected', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'ruby \'1.9.3\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'ruby19');
  });

  it('should get 2.0 ruby version when detected', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'ruby \'2.0.0\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'ruby20');
  });

  it('should get 2.1 ruby version when detected', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'ruby \'2.1.0\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'ruby21');
  });

  it('should get jruby if detected', () => {
    var gemfilePath = '/tmp/azk-test-30501680wvr4/front/Gemfile';
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      'ruby \'1.9.3\', :engine => \'jruby\', :engine_version => \'1.7.16\'',
    ].join('\n');

    var evidence = rule.getEvidence(gemfilePath, gemfileContent);
    h.expect(evidence).to.have.deep.property('ruleName', 'jruby17');
  });

});
