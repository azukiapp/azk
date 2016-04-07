import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/elixir_phoenix';
import { path, fs } from 'azk';

describe('Azk generators, Elixir Phoenix rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;
  var mixfilePath    = path.join(h.fixture_path('elixir_app'), 'mix_phoenix.exs');
  var mixfileContent = fs.readFileSync(mixfilePath).toString();
  var content, regex;

  before(function() {
    outputs = [];
    UI      = h.mockUI(beforeEach, outputs);
    rule    = new Rule(UI);
  });

  beforeEach(function () {
    content = mixfileContent;
    regex = /\{:phoenix\,\ "(.*)"\}\,/gm;
  });

  it('should return an evidence object', () => {
    var evidence = rule.getEvidence(mixfilePath, content);

    h.expect(evidence).to.have.deep.property('fullpath'  , mixfilePath);
    h.expect(evidence).to.have.deep.property('ruleType'  , 'framework');
    h.expect(evidence).to.have.deep.property('name'      , 'elixir_phoenix');
    h.expect(evidence).to.have.deep.property('ruleName'  , 'elixir_phoenix');
    h.expect(evidence).to.have.deep.property('version'   , '1.0.0');
    h.expect(evidence).to.have.deep.property('framework' , '1.1.4');
    h.expect(evidence).to.have.deep.property('replaces').deep.eql(['elixir', 'node']);
  });

  it('should version 0.12.0 when set 0.12', () => {
    content = content.replace(regex, '{:phoenix, "~> 0.12"},');
    var evidence = rule.getEvidence(mixfilePath, content);

    h.expect(evidence).to.have.deep.property('fullpath'  , mixfilePath);
    h.expect(evidence).to.have.deep.property('ruleType'  , 'framework');
    h.expect(evidence).to.have.deep.property('name'      , 'elixir_phoenix');
    h.expect(evidence).to.have.deep.property('ruleName'  , 'elixir_phoenix');
    h.expect(evidence).to.have.deep.property('version'   , '1.0.0');
    h.expect(evidence).to.have.deep.property('framework' , '0.12.0');
    h.expect(evidence).to.have.deep.property('replaces').deep.eql(['elixir', 'node']);
  });

  it('should version 0.0.0 when set 0', () => {
    content = content.replace(regex, '{:phoenix, "~> 0"},');
    var evidence = rule.getEvidence(mixfilePath, content);

    h.expect(evidence).to.have.deep.property('fullpath'  , mixfilePath);
    h.expect(evidence).to.have.deep.property('ruleType'  , 'framework');
    h.expect(evidence).to.have.deep.property('name'      , 'elixir_phoenix');
    h.expect(evidence).to.have.deep.property('ruleName'  , 'elixir_phoenix');
    h.expect(evidence).to.have.deep.property('version'   , '1.0.0');
    h.expect(evidence).to.have.deep.property('framework' , '0.0.0');
    h.expect(evidence).to.have.deep.property('replaces').deep.eql(['elixir', 'node']);
  });

  it('should null evidence do not found framework deps', () => {
    content = content.replace(regex, '');
    var evidence = rule.getEvidence(mixfilePath, content);

    h.expect(evidence).to.eql(null);
  });
});
