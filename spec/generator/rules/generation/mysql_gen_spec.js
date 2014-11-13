import { config, path, fs, utils } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';
var qfs = require('q-io/fs');

describe('Azk generator generation mysql rule', function() {
  var project = null;
  var name    = null;
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

    /******************************************************************************/
    // { manifest:
    //    { images: {},
    //      systems:
    //       { 'project-rails':
    //          { manifest: [Circular],
    //            name: 'project-rails',
    //            image: [Object],
    //            __options: [Object] },
    //         'project-mysql': [Circular] },
    //      bins: {},
    //      _default: 'project-rails',
    //      cwd: '/tmp/azk-test-1876421jcflc/project',
    //      __file: '/tmp/azk-test-1876421jcflc/project/Azkfile.js',
    //      __cache_dir: '/tmp/azk-test-1876421jcflc/project/.azk/Azkfile.js',
    //      meta: { manifest: [Circular], __cache: null } },
    //   name: 'project-mysql',
    //   image: { repository: 'mysql', tag: '5.6' },
    //   __options:
    //    { shell: '/bin/sh',
    //      depends: [ [length]: 0 ],
    //      envs:
    //       { MYSQL_ROOT_PASSWORD: 'mysecretpassword',
    //         MYSQL_USER: 'azk',
    //         MYSQL_PASSWORD: 'password',
    //         MYSQL_DATABASE: 'my_database' },
    //      scalable: false,
    //      workdir: '/azk/project',
    //      command: null,
    //      mounts:
    //       { '/var/lib/mysql':
    //          { type: 'persistent',
    //            value: 'mysql_libproject-mysql' } },
    //      ports: { portA: '3306/tcp' },
    //      export_envs: { DATABASE_URL: 'mysql://#{envs.MYSQL_USER}:#{envs.MYSQL_PASSWORD}@#{net.host}:#{net.port.data}/#{envs.MYSQL_DATABASE}' } } }

    /******************************************************************************/

    var mysqlSystem = manifest.systems[path.basename(projectFolder) + '-mysql'];


    h.expect(mysqlSystem).to.have.deep.property('name', path.basename(projectFolder) + '-mysql');
    h.expect(mysqlSystem).to.have.deep.property('image.name', 'mysql:5.6');
    h.expect(mysqlSystem).to.have.deep.property('depends').and.to.eql([]);

    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_ROOT_PASSWORD', 'mysecretpassword');
    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_USER', 'azk');
    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_PASSWORD', 'password');
    h.expect(mysqlSystem).to.have.deep.property('options.envs.MYSQL_DATABASE', 'my_database');

    h.expect(mysqlSystem).to.not.have.deep.property('options.provision');
    h.expect(mysqlSystem).to.not.have.deep.property('command');
    h.expect(mysqlSystem).to.not.have.deep.property('workdir');
  });

});