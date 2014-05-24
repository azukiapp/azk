import { config, path, fs, _ } from 'azk';
import h from 'spec/spec_helper';
import { generator } from 'azk/generator';

var touch = require('touch');

describe("Azk generator tool", function() {
  it("should load default rules", function() {
    var node = generator.rule("node");
    h.expect(node).to.have.property("type", "runtime");
  });

  it("should format template", function() {
    return h.tmp_dir({ prefix: "azk-" }).then((project) => {
      var manifest = path.join(project, config('manifest'));

      // Genereate manifest file
      var front = {
        name : 'front',
        depends: ['db'],
        image: { repository: 'base', tag: '0.1' },
        sync_files: true,
        command: 'bundle exec rackup config.ru',
        envs: { RACK_ENV: 'dev' },
      };
      generator.render({
        systems: [front],
        default: 'front',
      }, manifest);

      var data = fs.readFileSync(manifest).toString();
      h.expect(data).to.match(/front: \{/);
      h.expect(data).to.match(/depends: \["db"\]/);
      h.expect(data).to.match(/image: \{.*repository.*base.*\}/);
      h.expect(data).to.match(/sync_files: \{\n.*\/app/g);
      h.expect(data).to.match(/setDefault\("front"\);/);
    });
  })
});


