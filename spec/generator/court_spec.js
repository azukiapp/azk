import h from 'spec/spec_helper';
import { path, _, fsAsync } from 'azk';
import { async } from 'azk/utils/promises';
import { Court } from 'azk/generator/court';

describe('Azk generator tool court veredict:', function() {

  var rootFullPath;
  var court;

  before(function () {
    return async(this, function* () {
      var outputs = [];
      var UI  = h.mockUI(beforeEach, outputs);
      var dir = yield h.tmp_dir();

      // -------
      // Gemfile
      // -------
      rootFullPath = dir;
      var frontFolder = path.join(rootFullPath, 'front');
      yield fsAsync.mkdirs(frontFolder);
      var  gemfilePath = path.join(frontFolder, 'Gemfile');
      var gemfileContent = [
        'source \'https://rubygems.org\'',
        '',
        'gem \'rails\', \'4.1.6\'',
        'gem \'pg\', \'~> 0.17.1\'',
      ].join('\n');
      yield fsAsync.writeFile(gemfilePath, gemfileContent);

      // -------
      // package.json
      // -------
      var apiFolder = path.join(rootFullPath, 'api');
      yield fsAsync.mkdirs(apiFolder);
      var packageJsonPath = path.join(apiFolder, 'package.json');
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
      yield fsAsync.writeFile(packageJsonPath, packageJsonContent);
      var realRulesFolder = path.join(__dirname, '../../azk/generator/rules');
      court = new Court(realRulesFolder, UI);
    });
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
    var relevantProjectFiles = court._relevantProjectFiles(rootFullPath, relevantFiles);

    h.expect(relevantProjectFiles.length).to.equal(2);
  });

  it('should load rules when calling court.rule()', function() {
    var node = court.rule('node');
    h.expect(node).to.have.property('type', 'runtime');

    var rails = court.rule('ruby_on_rails');
    h.expect(rails).to.have.property('type', 'framework');
  });

  it('should _replacesEvidences() replaces ruby with rails', function() {
    court._investigate(rootFullPath).then(function () {
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
               ruleName:'node012',     <----------  [0][0]
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
               ruleName:'rails',     <----------  [1][1]
               replaces:[ 'ruby', 'node' ],
               version:'4.1.6'
            },
         ]
      ]
      */
      var filteredEvidences = _.values(court.__evidences_by_folder);

      h.expect(filteredEvidences[0][0]).to.have.property('ruleName', 'node012');
      h.expect(filteredEvidences[1][0]).to.have.property('ruleName', 'postgres93');
      h.expect(filteredEvidences[1][1]).to.have.property('ruleName', 'ruby_on_rails');
    });
  });

  it('should judge and insert database dependency on rails', function() {
    return court.judge(rootFullPath).then(function () {
      var folders = Object.keys(court.__folder_evidences_suggestion);
      h.expect(folders).to.have.length(2);
    });
  });

  it('should judge and suggest a valid node system', function() {
    return court.judge(rootFullPath).then(function () {
      // first evidence
      var evidence0 = court.__folder_evidences_suggestion[0].suggestions[0];
      var firstEvidence = evidence0;
      h.expect(firstEvidence).to.have.property('ruleType', 'runtime');
      h.expect(firstEvidence).to.have.property('name', 'node');
      h.expect(firstEvidence).to.have.property('ruleName', 'node-0.12');
      h.expect(firstEvidence).to.have.property('version', '0.4.1');

      // first suggestion
      var firstSuggestion = evidence0.suggestionChoosen.suggestion;
      h.expect(firstSuggestion).to.have.property('name', 'api');
      h.expect(evidence0.suggestionChoosen.ruleNamesList).to.contains('node-0.12');
      h.expect(firstSuggestion).have.property('__type', 'node 0.12');
    });
  });

  it('should suggest systems for the Azkfile.js template', function() {
    return court.judge(rootFullPath).then(function () {
      var folders = Object.keys(court.systems_suggestions);
      h.expect(folders).to.have.length(3);

      h.expect(folders).to.contains('api');
      h.expect(folders).to.contains('front');
      h.expect(folders).to.contains('postgres');
    });
  });
});
