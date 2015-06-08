import { config, path, fs, fsAsync } from 'azk';
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
    return h.tmp_dir().then((dir) => {
      // save root dir
      rootFolder = dir;
      rootFolderBasename = path.basename(dir);

      //create rails folder with mysql dependency
      var projectFolder = path.join(rootFolder, 'railsMysql');
      fs.mkdirSync(projectFolder);
      var gemfilePath = path.join(projectFolder, 'Gemfile');
      h.touchSync(gemfilePath);
      var gemfileContent = [
        'source \'https://rubygems.org\'',
        '',
        'gem \'rails\', \'4.1.6\'',
        'gem \'mysql2\'',
      ].join('\n');
      return fsAsync.writeFile(gemfilePath, gemfileContent);
    }).then(() => {

      //create rails folder with postgres dependency
      var projectFolder = path.join(rootFolder, 'railsPostgres');
      fs.mkdirSync(projectFolder);
      var gemfilePath = path.join(projectFolder, 'Gemfile');
      h.touchSync(gemfilePath);
      var gemfileContent = [
        'source \'https://rubygems.org\'',
        '',
        'gem \'rails\', \'4.1.6\'',
        'gem \'pg\'',
      ].join('\n');
      return fsAsync.writeFile(gemfilePath, gemfileContent);
    });
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    generator.render({
      systems: generator.findSystems(project),
    }, manifest);
    return new Manifest(project);
  };

  describe('2 rails and 2 databases', function() {
    var manifest;

    before(function() {
      manifest = generateAndReturnManifest(rootFolder);
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
        h.expect(system).to.have.deep.property('options.wait.retry', 25);
        h.expect(system).to.have.deep.property('options.wait.timeout', 1000);
        h.expect(system).to.not.have.deep.property('options.workdir');
        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(
          { '/var/lib/mysql': { type: 'persistent',
                                value: 'mysql_libmysql',
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
        h.expect(system).to.have.deep.property('image.tag', '9.3');

        // __options
        h.expect(system).to.have.deep.property('options.depends').and.to.eql([]);
        h.expect(system).to.have.deep.property('options.shell', '/bin/bash');
        h.expect(system).to.have.deep.property('options.wait.retry', 20);
        h.expect(system).to.have.deep.property('options.wait.timeout', 1000);
        h.expect(system).to.not.have.deep.property('options.workdir');
        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(
          { '/var/lib/postgresql': { type: 'persistent', value: 'postgresql', options: {} },
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
        h.expect(system).to.have.deep.property('options.wait.retry', 20);
        h.expect(system).to.have.deep.property('options.wait.timeout', 1000);

        var workdir = path.join('/azk', rootFolderBasename, 'railsMysql');
        h.expect(system).to.have.deep.property('options.workdir', workdir);

        var expectedMounts = {};
        expectedMounts[workdir] = { type: 'sync', value: './railsMysql', options: {} };
        expectedMounts[path.join('/azk', rootFolderBasename, 'log')] = {
          type: 'persistent', value: `log-${systemName}`, options: {}
        };
        expectedMounts[path.join('/azk', rootFolderBasename, 'tmp')] = {
          type: 'persistent', value: `tmp-${systemName}`, options: {}
        };
        expectedMounts['/azk/bundler'] = { type: 'persistent', value: 'bundler', options: {} };

        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(
          expectedMounts );
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
        h.expect(system).to.have.deep.property('options.wait.retry', 20);
        h.expect(system).to.have.deep.property('options.wait.timeout', 1000);

        var workdir = path.join('/azk', rootFolderBasename, 'railsPostgres');
        h.expect(system).to.have.deep.property('options.workdir', workdir);

        var expectedMounts = {};
        expectedMounts[workdir] = { type: 'sync', value: './railsPostgres', options: {} };
        expectedMounts[path.join('/azk', rootFolderBasename, 'log')] = {
          type: 'persistent', value: `log-${systemName}`, options: {}
        };
        expectedMounts[path.join('/azk', rootFolderBasename, 'tmp')] = {
          type: 'persistent', value: `tmp-${systemName}`, options: {}
        };
        expectedMounts['/azk/bundler'] = { type: 'persistent', value: 'bundler', options: {} };

        h.expect(system).to.have.deep.property('options.mounts').and.to.eql(
          expectedMounts );
      });
    });
  });
});
