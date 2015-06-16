import { config, path, fsAsync, utils } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe('Azk generator generation node rule', function() {
  var project_folder = null;
  var project_folder_name    = null;
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  beforeEach(function() {
    return h.tmp_dir().then((dir) => {
      project_folder      = dir;
      project_folder_name = path.basename(dir);
    });
  });

  var generateAndReturnManifest = (folder) => {
    var manifest = path.join(folder, config('manifest'));
    return generator.findSystems(folder).then(function (all_systems) {
      return generator.render({ systems: all_systems }, manifest).then(function() {
        return new Manifest(folder);
      });
    });
  };

  it('should detect single node system', function() {
    return fsAsync.createFile(path.join(project_folder, 'package.json')).then(function() {
      return generateAndReturnManifest(project_folder);
    })
    .then(function (manifest) {
      var system   = manifest.systemDefault;
      var command  = new RegExp(h.escapeRegExp('npm start'));

      h.expect(system).to.have.deep.property('name', project_folder_name);
      h.expect(system).to.have.deep.property('image.name', 'azukiapp/node:0.12');
      h.expect(system).to.have.deep.property('depends').and.to.eql([]);
      h.expect(system).to.have.deep.property('command').and.to.match(command);

      var expectedMounts = {};
      var workdir = '/azk/' + project_folder_name;
      expectedMounts[workdir] = utils.docker.resolvePath(manifest.manifestPath);

      h.expect(system).to.have.deep.property('options.workdir', workdir);
      h.expect(system).to.have.deep.property('options.provision')
        .and.to.eql(['npm install']);

      h.expect(system).to.have.property('scalable').and.eql({ default: 1, limit: -1 });
      h.expect(system).to.have.property('hostname').and.match(new RegExp(project_folder_name));
    });
  });

  it('should detect sub-system', function() {
    var sub = path.join(project_folder, 'sub');
    return fsAsync.mkdirs(sub).then(function() {
      return fsAsync.createFile(path.join(sub, 'package.json')).then(function () {
        return generateAndReturnManifest(project_folder).then(function (manifest) {
          var system   = manifest.system('sub');
          h.expect(system).to.have.deep.property('name', 'sub');
          h.expect(system).to.have.deep.property('options.workdir', '/azk/' + project_folder_name + '/sub');
        });
      });
    });
  });
});
