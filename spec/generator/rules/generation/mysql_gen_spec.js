import { config, path, fs } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';
var qfs = require('q-io/fs');

describe('Azk generator generation mysql rule', function() {
  var project = null;
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  var projectFolder;
  var createTestFolders = h.tmp_dir().then((dir) => {
    // -------
    // Gemfile
    // -------
    projectFolder = path.join(dir, 'project');
    fs.mkdirSync(projectFolder);
    var  gemfilePath = path.join(projectFolder, 'Gemfile');
    h.touchSync(gemfilePath);
    var gemfileContent = [
      'source \'https://rubygems.org\'',
      '',
      'gem \'rails\', \'4.1.6\'',
      'gem \'mysql2\'',
    ].join('\n');
    return qfs.write(gemfilePath, gemfileContent);

  });

  before(function() {
    return createTestFolders;
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    generator.render({
      systems: generator.findSystems(project),
    }, manifest);
    return new Manifest(project);
  };

  it('should detect single mysql system', function() {
    var manifest = generateAndReturnManifest(projectFolder);

    var mysqlSystem = manifest.systems[path.basename(projectFolder) + '-mysql'];

    h.expect(mysqlSystem).to.have.deep.property('name', path.basename(projectFolder) + '-mysql');
    h.expect(mysqlSystem).to.have.deep.property('image.name', 'mysql:5.6');
    h.expect(mysqlSystem).to.have.deep.property('depends').and.to.eql([]);

    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_ROOT_PASSWORD', 'mysecretpassword');
    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_USER', 'azk');
    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_PASSWORD', 'password');
    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_DATABASE', 'my_database');

    h.expect(mysqlSystem).to.not.have.deep.property('options.provision');
    h.expect(mysqlSystem).to.not.have.deep.property('options.command');
    h.expect(mysqlSystem).to.not.have.deep.property('options.workdir');
  });

  it('should rails have a mysql dependency', function() {
    var manifest = generateAndReturnManifest(projectFolder);
    var railsSystem = manifest.systems[path.basename(projectFolder) + '-rails'];

    h.expect(railsSystem).to.have.deep.property('name', path.basename(projectFolder) + '-rails');
    h.expect(railsSystem).to.have.deep.property('depends').and.to.eql([path.basename(projectFolder) + '-mysql']);
  });

});