import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/elixir';
import { path, fs } from 'azk';

describe('Azk generators, Elixir rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;
  var mixfilePath    = path.join(h.fixture_path('elixir_app'), 'mix.exs');
  var mixfileContent = fs.readFileSync(mixfilePath).toString();
  var content, regex;

  before(function() {
    outputs = [];
    UI      = h.mockUI(beforeEach, outputs);
    rule    = new Rule(UI);
  });

  beforeEach(function () {
    content = mixfileContent;
    regex = new RegExp(h.escapeRegExp('elixir: "~> 1.0",'));
  });

  it('should return an evidence object', () => {
    var evidence = rule.getEvidence(mixfilePath, content);

    h.expect(evidence).to.have.deep.property('fullpath', mixfilePath);
    h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
    h.expect(evidence).to.have.deep.property('name'    , 'elixir');
    h.expect(evidence).to.have.deep.property('ruleName', 'elixir-1.0');
    h.expect(evidence).to.have.deep.property('version' , '1.0.0');
  });

  describe('should version is', function () {
    it('1.0.0 from 1', () => {
      content = content.replace(regex, 'elixir: "~> 1",');
      var evidence = rule.getEvidence(mixfilePath, content);

      h.expect(evidence).to.have.deep.property('fullpath', mixfilePath);
      h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
      h.expect(evidence).to.have.deep.property('name'    , 'elixir');
      h.expect(evidence).to.have.deep.property('ruleName', 'elixir-1.0');
      h.expect(evidence).to.have.deep.property('version' , '1.0.0');
    });

    it('0.8.0 from 0.8', () => {
      content = content.replace(regex, 'elixir: "~> 0.8",');
      var evidence = rule.getEvidence(mixfilePath, content);

      h.expect(evidence).to.have.deep.property('fullpath', mixfilePath);
      h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
      h.expect(evidence).to.have.deep.property('name'    , 'elixir');
      h.expect(evidence).to.have.deep.property('ruleName', 'elixir-1.0');
      h.expect(evidence).to.have.deep.property('version' , '0.8.0');
    });

    it('1.1.0 from 1.1', () => {
      content = content.replace(regex, 'elixir: "~> 1.1",');
      var evidence = rule.getEvidence(mixfilePath, content);

      h.expect(evidence).to.have.deep.property('fullpath', mixfilePath);
      h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
      h.expect(evidence).to.have.deep.property('name'    , 'elixir');
      h.expect(evidence).to.have.deep.property('ruleName', 'elixir-1.1');
      h.expect(evidence).to.have.deep.property('version' , '1.1.0');
    });

    it('1.2.0 from 1.2', () => {
      content = content.replace(regex, 'elixir: "~> 1.2",');
      var evidence = rule.getEvidence(mixfilePath, content);

      h.expect(evidence).to.have.deep.property('fullpath', mixfilePath);
      h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
      h.expect(evidence).to.have.deep.property('name'    , 'elixir');
      h.expect(evidence).to.have.deep.property('ruleName', 'elixir-1.2');
      h.expect(evidence).to.have.deep.property('version' , '1.2.0');
    });

    it('latest from not found engine', () => {
      content = content.replace(regex, '');
      var evidence = rule.getEvidence(mixfilePath, content);

      h.expect(evidence).to.have.deep.property('fullpath', mixfilePath);
      h.expect(evidence).to.have.deep.property('ruleType', 'runtime');
      h.expect(evidence).to.have.deep.property('name'    , 'elixir');
      h.expect(evidence).to.have.deep.property('ruleName', 'elixir-1.2');
      h.expect(evidence).to.have.deep.property('version' , undefined);
    });
  });
});
