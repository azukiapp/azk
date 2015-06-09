import { config, path, fs, fsAsync } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe('Azk generator generation two nodes systems', function() {
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

      return fsAsync.writeFile(packageJson, '');
    });
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    return generator.findSystems(project).then(function (all_systems) {
      return generator.render({ systems: all_systems }, manifest).then(function() {
        return new Manifest(project);
      });
    });
  };

  it('should detect two node projects', function() {
    return generateAndReturnManifest(rootFolder).then(function (manifest) {
      var allKeys = Object.keys(manifest.systems);
      h.expect(allKeys).to.have.contains('node1');
      h.expect(allKeys).to.have.contains('node2');
    });
  });
});
