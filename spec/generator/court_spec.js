import h from 'spec/spec_helper';
import { path, fs } from 'azk';
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
      '',
      '# Bundle edge Rails instead: gem \'rails\', github: \'rails/rails\'',
      'gem \'rails\', \'4.1.6\'',
      '# Use sqlite3 as the database for Active Record',
      'gem \'sqlite3\'',
      '# Use SCSS for stylesheets',
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

    h.expect(relevantFiles.length).to.equal(2);
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
    h.expect(court.__evidences).to.have.length(3);
  });

  it('should replacesevidences_by_folder() replaces ruby with rails', function() {
    court._investigate(rootFullPath);
    court._replacesEvidences();
    var folders = Object.keys(court.__evidences_by_folder);
    h.expect(folders).to.have.length(2);
  });

  it('should judge and suggest a manifest', function() {
    court.judge(rootFullPath);
    var folders = Object.keys(court.__folders_suggestions);

    h.expect(folders).to.have.length(2);

    // evidence
    var firstEvidence = court.__folders_suggestions[0].evidence[0];
    h.expect(firstEvidence).to.have.property('ruleType', 'runtime');
    h.expect(firstEvidence).to.have.property('name', 'node');
    h.expect(firstEvidence).to.have.property('ruleName', 'node010');
    h.expect(firstEvidence).to.have.property('version', '0.4.1');

    // suggestion
    var firstSuggestion = court.__folders_suggestions[0].suggestionChoosen;
    h.expect(firstSuggestion).to.have.property('name', 'node 0.10.x');
    h.expect(firstSuggestion.ruleNamesList).to.contains('node010');
    h.expect(firstSuggestion.suggestion).have.property('__type', 'node.js');
  });

  it('should suggest systems for the Azkfile.js template', function() {
    court.judge(rootFullPath);
    var folders = Object.keys(court.systems_suggestions);
    h.expect(folders).to.have.length(2);
  });

});
