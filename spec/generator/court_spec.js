import h from 'spec/spec_helper';
import { path, fs, _ } from 'azk';
import { Court } from 'azk/generator/court';
var qfs = require('q-io/fs');

describe('Azk generator tool court veredict:', function() {

  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var rootFullPath;
  var court;

  var createTestFolders = h.tmp_dir().then((dir) => {
    // -------
    // Gemfile
    // -------
    rootFullPath = dir;
    var frontFolder = path.join(rootFullPath, 'front');
    fs.mkdirSync(frontFolder);
    var  gemfilePath = path.join(frontFolder, 'Gemfile');
    h.touchSync(gemfilePath);
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      '',
      'gem \'rails\', \'4.1.6\'',
      'gem \'pg\', \'~> 0.17.1\'',
    ].join('\n');
    return qfs.write(gemfilePath, gemfileContent);

  }).then(() => {
    // -------
    // package.json
    // -------
    var apiFolder = path.join(rootFullPath, 'api');
    fs.mkdirSync(apiFolder);
    var packageJsonPath = path.join(apiFolder, 'package.json');
    h.touchSync(packageJsonPath);
    var packageJsonContent = [
      '{',
      '  "name": "best-practices",',
      '  "description": "A package using versioning best-practices",',
      '  "author": "Charlie Robbins <charlie@nodejitsu.com>",',
      '  "dependencies": {',
      '    "colors": "0.x.x",',
      '    "express": "2.3.x",',
      '    "optimist": "0.2.x"',
      '  },',
      '  "devDependencies": {',
      '    "vows": "0.5.x"',
      '  },',
      '  "engine": "node >= 0.4.1"',
      '}',
    ].join('\n');
    return qfs.write(packageJsonPath, packageJsonContent);
  });

  before(function() {
    var realRulesFolder = path.join(__dirname, '../../azk/generator/rules');
    court = new Court(realRulesFolder, UI);
    return createTestFolders;
  });

  it('rules should return all relevant files', function() {
    // Asks rule about which files to lookup
    var relevantFiles = court.relevantsFiles();

    h.expect(relevantFiles).to.include('Gemfile');
    h.expect(relevantFiles).to.include('package.json');
  });

  it('should find relevant files on project folder', function() {
    // Asks rule about which files to lookup
    var relevantFiles = court.relevantsFiles();

    var relevantProjectFiles = court._relevantProjectFiles(
      rootFullPath, relevantFiles);

    h.expect(relevantProjectFiles.length).to.equal(2);
  });

  it('should load rules when calling court.rule()', function() {
    var node = court.rule('node');
    h.expect(node).to.have.property('type', 'runtime');

    var rails = court.rule('rails41');
    h.expect(rails).to.have.property('type', 'framework');
  });

  it('should return an array with evidences on investigate() call', function() {
    court._investigate(rootFullPath);
    h.expect(court.__evidences).to.have.length(4);
  });

  it('should _replacesEvidences() replaces ruby with rails', function() {
    court._investigate(rootFullPath);
    court._replacesEvidences();

    var keys = Object.keys(court.__evidences_by_folder);
    h.expect(keys).to.have.length(2);

    /*
    [
       [
          {
             fullpath:'/tmp/azk-test-302101g49y9s/api/package.json',
             ruleType:'runtime',
             name:'node',
             ruleName:'node010',     <----------  [0][0]
             version:'0.4.1'
          }
       ],
       [
          {
             fullpath:'/tmp/azk-test-302101g49y9s/front/Gemfile',
             ruleType:'database',
             name:'postgres',
             ruleName:'postgres93'   <----------  [1][0]
          }
          {
             fullpath:'/tmp/azk-test-302101g49y9s/front/Gemfile',
             ruleType:'framework',
             name:'rails',
             ruleName:'rails41',     <----------  [1][1]
             replaces:[ 'ruby', 'node' ],
             version:'4.1.6'
          },
       ]
    ]
    */
    var filteredEvidences = _.values(court.__evidences_by_folder);

    h.expect(filteredEvidences[0][0]).to.have.property('ruleName', 'node010');
    h.expect(filteredEvidences[1][0]).to.have.property('ruleName', 'postgres93');
    h.expect(filteredEvidences[1][1]).to.have.property('ruleName', 'rails41');

  });

  it('should judge and insert database dependency on rails', function() {
    court.judge(rootFullPath);
    var folders = Object.keys(court.__folder_evidences_suggestion);
    h.expect(folders).to.have.length(2);

  });

  it('should judge and suggest a valid node system', function() {
    court.judge(rootFullPath);

    // first evidence
    var evidence0 = court.__folder_evidences_suggestion[0].suggestions[0];
    var firstEvidence = evidence0;
    h.expect(firstEvidence).to.have.property('ruleType', 'runtime');
    h.expect(firstEvidence).to.have.property('name', 'node');
    h.expect(firstEvidence).to.have.property('ruleName', 'node010');
    h.expect(firstEvidence).to.have.property('version', '0.4.1');

    // first suggestion
    var firstSuggestion = evidence0.suggestionChoosen.suggestion;
    h.expect(firstSuggestion).to.have.property('name', 'api');
    h.expect(evidence0.suggestionChoosen.ruleNamesList).to.contains('node010');
    h.expect(firstSuggestion).have.property('__type', 'node.js');
  });

  it('should suggest systems for the Azkfile.js template', function() {
    court.judge(rootFullPath);
    var folders = Object.keys(court.systems_suggestions);
    h.expect(folders).to.have.length(3);

    h.expect(folders).to.contains('api');
    h.expect(folders).to.contains('front');
    h.expect(folders).to.contains('postgres');

  });

});
