import { config, path, fsAsync } from 'azk';
import { async } from 'azk/utils/promises';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe('Azk generator db', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  var rootFolder;
  var rootFolderBasename;

  before(function() {
    return async(this, function* () {
      var dir;
      var projectFolder;
      var gemfilePath;
      var gemfileContent;

      dir = yield h.tmp_dir();
      // save root dir
      rootFolder = dir;
      rootFolderBasename = path.basename(dir);

      // rails + mysql
      projectFolder = path.join(rootFolder, 'railsMysql');
      yield fsAsync.mkdirs(projectFolder);
      gemfilePath = path.join(projectFolder, 'Gemfile');
      gemfileContent = [
        'source \'https://rubygems.org\'',
        '',
        'gem \'rails\', \'4.1.6\'',
        'gem \'mysql2\'',
      ].join('\n');
      yield fsAsync.writeFile(gemfilePath, gemfileContent);

      // rails + postgres
      projectFolder = path.join(rootFolder, 'railsPostgres');
      yield fsAsync.mkdirs(projectFolder);
      gemfilePath = path.join(projectFolder, 'Gemfile');
      gemfileContent = [
        'source \'https://rubygems.org\'',
        '',
        'gem \'rails\', \'4.1.6\'',
        'gem \'pg\'',
      ].join('\n');
      yield fsAsync.writeFile(gemfilePath, gemfileContent);
    });
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    return generator.findSystems(project)
    .then(function (all_systems) {
      return generator.render({ systems: all_systems }, manifest)
      .then(function() {
        return new Manifest(project);
      });
    });
  };

  describe('2 rails and 2 databases', function() {
    var manifest;

    before(function() {
      return generateAndReturnManifest(rootFolder).then(function (manifest_generated) {
        manifest = manifest_generated;
      });
    });

    it('should detect 4 systems', function() {
      var allKeys = Object.keys(manifest.systems);
      h.expect(allKeys).to.have.length(4);
      h.expect(allKeys).to.have.contains('mysql');
      h.expect(allKeys).to.have.contains('postgres');
      h.expect(allKeys).to.have.contains('railsMysql');
      h.expect(allKeys).to.have.contains('railsPostgres');
    });

    describe('mysql system', function() {
      var systemName;
      var system;

      before(function() {
        systemName = 'mysql';
        system = manifest.systems[systemName];
      });

      it('should has correct properties', function() {
        // main properties
        h.expect(system).to.have.property('name', 'mysql');
        h.expect(system).to.have.deep.property('image.repository', 'azukiapp/mysql');
        h.expect(system).to.have.deep.property('image.tag', '5.6');

        // __options
        h.expect(system).to.have.deep.property('options.depends').and.to.eql([]);
        h.expect(system).to.have.deep.property('options.shell', '/bin/bash');
        h.expect(system).to.have.deep.property('options.wait', 150);
        h.expect(system).to.not.have.deep.property('options.workdir');
        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(
          { '/var/lib/mysql': { type: 'persistent',
                                value: `${manifest.manifestDirName}/mysql`,
                                options: {} } } );
      });
    });

    describe('postgres system', function() {
      var systemName;
      var system;

      before(function() {
        systemName = 'postgres';
        system = manifest.systems[systemName];
      });

      it('should has correct properties', function() {
        // main properties
        h.expect(system).to.have.property('name', 'postgres');
        h.expect(system).to.have.deep.property('image.repository', 'azukiapp/postgres');
        h.expect(system).to.have.deep.property('image.tag', '9.4');

        // __options
        h.expect(system).to.have.deep.property('options.depends').and.to.eql([]);
        h.expect(system).to.have.deep.property('options.shell', '/bin/bash');
        h.expect(system).to.have.deep.property('options.wait', 150);
        h.expect(system).to.not.have.deep.property('options.workdir');
        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(
          { '/var/lib/postgresql/data': { type: 'persistent', value: 'postgresql', options: {} },
            '/var/log/postgresql': { type: 'path',       value: './log/postgresql', options: {} } } );
      });
    });

    describe('railsMysql system', function() {
      var systemName;
      var system;

      before(function() {
        systemName = 'railsMysql';
        system = manifest.systems[systemName];
      });

      it('should has correct properties', function() {
        // main properties
        h.expect(system).to.have.property('name', 'railsMysql');
        h.expect(system).to.have.deep.property('image.repository', 'azukiapp/ruby');
        h.expect(system).to.have.deep.property('image.tag', 'latest');

        // __options
        h.expect(system).to.have.deep.property('options.depends').and.to.eql(['mysql']);
        h.expect(system).to.have.deep.property('options.shell', '/bin/bash');
        h.expect(system).to.have.deep.property('options.wait', 20);

        var workdir = path.join('/azk', rootFolderBasename, 'railsMysql');
        h.expect(system).to.have.deep.property('options.workdir', workdir);

        var expectedMounts = {};
        var folderSystem = `${rootFolderBasename}/${systemName}`;
        // /azk/azk-test-60957fmnsb4/railsPostgres
        expectedMounts[path.join('/azk', folderSystem)] = {
          type: 'sync', value: `./${systemName}`, options: {}
        };
        expectedMounts[path.join('/azk', folderSystem, '.bundle')] = {
          type: 'path', value: `./${systemName}/.bundle`, options: {}
        };
        expectedMounts[path.join('/azk', folderSystem, 'log')] = {
          type: 'path', value: `./${systemName}/log`, options: {}
        };
        expectedMounts[path.join('/azk', folderSystem, 'tmp')] = {
          type: 'persistent', value: `./${systemName}/tmp`, options: {}
        };
        expectedMounts['/azk/bundler'] = { type: 'persistent', value: `./${systemName}/bundler`, options: {} };

        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(expectedMounts);
      });
    });

    describe('railsPostgres system', function() {
      var systemName;
      var system;

      before(function() {
        systemName = 'railsPostgres';
        system = manifest.systems[systemName];
      });

      it('should has correct properties', function() {
        // main properties
        h.expect(system).to.have.property('name', 'railsPostgres');
        h.expect(system).to.have.deep.property('image.repository', 'azukiapp/ruby');
        h.expect(system).to.have.deep.property('image.tag', 'latest');

        // __options
        h.expect(system).to.have.deep.property('options.depends').and.to.eql(['postgres']);
        h.expect(system).to.have.deep.property('options.shell', '/bin/bash');
        h.expect(system).to.have.deep.property('options.wait', 20);

        var workdir = path.join('/azk', rootFolderBasename, 'railsPostgres');
        h.expect(system).to.have.deep.property('options.workdir', workdir);

        var expectedMounts = {};
        var folderSystem = `${rootFolderBasename}/${systemName}`;
        // /azk/azk-test-60957fmnsb4/railsPostgres
        expectedMounts[path.join('/azk', folderSystem)] = {
          type: 'sync', value: `./${systemName}`, options: {}
        };
        expectedMounts[path.join('/azk', folderSystem, '.bundle')] = {
          type: 'path', value: `./${systemName}/.bundle`, options: {}
        };
        expectedMounts[path.join('/azk', folderSystem, 'log')] = {
          type: 'path', value: `./${systemName}/log`, options: {}
        };
        expectedMounts[path.join('/azk', folderSystem, 'tmp')] = {
          type: 'persistent', value: `./${systemName}/tmp`, options: {}
        };
        expectedMounts['/azk/bundler'] = { type: 'persistent', value: `./${systemName}/bundler`, options: {} };

        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(expectedMounts);
      });
    });
  });
});
