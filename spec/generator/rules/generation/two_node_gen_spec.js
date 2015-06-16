import { config, path, fsAsync } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';
import { async } from 'azk/utils/promises';

describe('Azk generator generation two nodes systems', function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  var rootFolder;

  before(function() {
    return async(this, function* () {
      var dir = yield h.tmp_dir();
      rootFolder = dir;

      // `node 1` system folder
      var projectFolder = path.join(dir, 'node1');
      yield fsAsync.mkdirs(projectFolder);

      var  packageJson = path.join(projectFolder, 'package.json');
      yield fsAsync.createFile(packageJson);

      // `node 2` system folder
      projectFolder = path.join(dir, 'node2');
      yield fsAsync.mkdirs(projectFolder);

      packageJson = path.join(projectFolder, 'package.json');
      yield fsAsync.createFile(packageJson);

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
