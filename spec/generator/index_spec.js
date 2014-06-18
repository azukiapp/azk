import { config, path, fs, _ } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';
import { example_system as node_example }  from 'azk/generator/rules/node';

var touch = require('touch');

describe("Azk generator tool", function() {
  var outputs = [];
  var UI = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  it("should load default rules", function() {
    var node = generator.rule("node");
    h.expect(node).to.have.property("type", "runtime");
  });

  it("should format template", function() {
    return h.tmp_dir().then((project) => {
      var manifest = path.join(project, config('manifest'));

      // Genereate manifest file
      generator.render({
        systems: {
          front: {
            depends: ['db'],
            workdir: '/azk/<%= manifest.dir %>',
            image: { repository: 'base', tag: '0.1' },
            mount_folders: true,
            command: 'bundle exec rackup config.ru',
            envs: { RACK_ENV: 'dev' },
          }
        },
        default: 'front',
        bins: [
          { name: "console", command: ["bundler", "exec"] }
        ]
      }, manifest);

      var manifest = new Manifest(project);
      var system   = manifest.systemDefault;
      var name     = path.basename(project);

      h.expect(system).to.have.deep.property("name", "front");
      h.expect(system).to.have.deep.property("image.name", "base:0.1");
      h.expect(system).to.have.deep.property("depends").and.to.eql(["db"]);
      h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name);
      h.expect(system).to.have.deep.property("options.mount_folders")
        .and.to.eql({ ".": "/azk/" + name});
      h.expect(system).to.have.deep.property("options.command")
        .and.to.eql("bundle exec rackup config.ru");
    });
  });
});


