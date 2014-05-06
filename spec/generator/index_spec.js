import { config } from 'azk';
import h from 'spec/spec_helper';
import { generator } from 'azk/generator';

var path  = require('path');
var touch = require('touch');
var fs    = require('fs');

describe("Azk generator tool", function() {
  var app_dir = null;
  var box_dir = null;

  it("should detect project type for path", function() {
    return h.tmp_dir({ prefix: "azk-" }).then((project) => {
      touch.sync(path.join(project, "Gemfile"));

      var detected = generator.inspect(project);
      h.expect(detected).to.have.property("box")
        .and.match(/ruby/);

      touch.sync(path.join(project, "package.json"));

      var detected = generator.inspect(project);
      h.expect(detected).to.have.property("box")
        .and.match(/node/);
    });
  })

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


