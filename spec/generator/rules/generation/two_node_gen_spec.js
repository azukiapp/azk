import { config, path, fs } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';
var qfs = require('q-io/fs');

describe('Azk generator generation two nodes systems', function() {
  var project = null;
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  var rootFolder;

  before(function() {
    return h.tmp_dir().then((dir) => {
      rootFolder = dir;

      // `node 1` system folder
      var projectFolder = path.join(dir, 'node1');
      fs.mkdirSync(projectFolder);
      var  packageJson = path.join(projectFolder, 'package.json');
      h.touchSync(packageJson);

      // `node 2` system folder
      projectFolder = path.join(dir, 'node2');
      fs.mkdirSync(projectFolder);
      packageJson = path.join(projectFolder, 'package.json');
      h.touchSync(packageJson);

      return qfs.write(packageJson, '');
    });
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    generator.render({
      systems: generator.findSystems(project),
    }, manifest);
    return new Manifest(project);
  };

  it('should detect two node projects', function() {
    var manifest = generateAndReturnManifest(rootFolder);

    var allKeys = Object.keys(manifest.systems);
    h.expect(allKeys).to.have.contains('node1');
    h.expect(allKeys).to.have.contains('node2');
  });

});