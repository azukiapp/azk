import h from 'spec/spec_helper';
import { Rule } from 'azk/generator/rules/django';

describe('Azk generators Django rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rule;

  before(function() {
    outputs = [];
    UI  = h.mockUI(beforeEach, outputs);
    rule = new Rule(UI);
  });

  it('should return an evidence object', () => {
    var frameworkPath = '/tmp/djangoProject/requirements.txt';
    var frameworkContent = [
      'BeautifulSoup==3.2.0',
      'Django==1.4',
      'Fabric==1.2.0',
      'Jinja2==2.5.5',
      'PyYAML==3.09',
      'Pygments==1.4',
      'SQLAlchemy==0.7.1',
      'South==0.7.3',
      'amqplib==0.6.1',
      'anyjson==0.3',
    ].join('\n');

    var evidence = rule.getEvidence(frameworkPath, frameworkContent);

    h.expect(evidence).to.have.deep.property('fullpath', frameworkPath);
    h.expect(evidence).to.have.deep.property('ruleType', 'framework');
    h.expect(evidence).to.have.deep.property('name'    , 'django');
    h.expect(evidence).to.have.deep.property('ruleName', 'djangoPython27');
    h.expect(evidence).to.have.deep.property('version' , '1.4.0');
  });

  it('should return djangoPython27 when django version is too low', () => {
    var frameworkPath = '/tmp/djangoProject/requirements.txt';
    var frameworkContent = [
      'Django==1.5.3',
    ].join('\n');

    var evidence = rule.getEvidence(frameworkPath, frameworkContent);

    h.expect(evidence).to.have.deep.property('version' , '1.5.3');
    h.expect(evidence).to.have.deep.property('ruleName', 'djangoPython27');
  });

  it('should return djangoPython34 when django version is above 1.7', () => {
    var frameworkPath = '/tmp/djangoProject/requirements.txt';
    var frameworkContent = [
      'Django==1.7.0',
    ].join('\n');

    var evidence = rule.getEvidence(frameworkPath, frameworkContent);

    h.expect(evidence).to.have.deep.property('version' , '1.7.0');
    h.expect(evidence).to.have.deep.property('ruleName', 'djangoPython34');
  });

});
