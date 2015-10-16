import { config, path, fsAsync } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe('Azk generator generation mysql rule', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  var projectFolder;
  var createTestFolders = h.tmp_dir().then((dir) => {
    // -------
    // Gemfile
    // -------
    projectFolder = path.join(dir, 'project');
    return fsAsync.mkdirs(projectFolder).then(function() {
      var  gemfilePath = path.join(projectFolder, 'Gemfile');
      var gemfileContent = [
        'source \'https://rubygems.org\'',
        '',
        'gem \'rails\', \'4.1.6\'',
        'gem \'mysql2\'',
      ].join('\n');
      return fsAsync.writeFile(gemfilePath, gemfileContent);
    });

  });

  before(function() {
    return createTestFolders;
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    return generator.findSystems(project).then(function (all_systems) {
      return generator.render({ systems: all_systems }, manifest).then(function() {
        return new Manifest(project);
      });
    });
  };

  it('should detect single mysql system', function() {
    return generateAndReturnManifest(projectFolder).then(function (manifest) {
      var mysqlSystem = manifest.systems.mysql;

      h.expect(mysqlSystem).to.have.deep.property('name', 'mysql');
      h.expect(mysqlSystem).to.have.deep.property('image.name', 'azukiapp/mysql:5.6');
      h.expect(mysqlSystem).to.have.deep.property('depends').and.to.eql([]);

      h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_USER', 'azk');
      h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_PASSWORD', 'azk');
      h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_DATABASE', 'project_development');

      h.expect(mysqlSystem).to.not.have.deep.property('options.provision');
      h.expect(mysqlSystem).to.not.have.deep.property('options.command');
      h.expect(mysqlSystem).to.not.have.deep.property('options.workdir');
    });

  });

  it('should rails have a mysql dependency', function() {
    return generateAndReturnManifest(projectFolder).then(function (manifest) {
      var railsSystem = manifest.systems.project;
      h.expect(railsSystem).to.have.deep.property('name', 'project');
      h.expect(railsSystem).to.have.deep.property('depends').and.to.eql(['mysql']);
    });
  });

});
