import { config } from 'azk';
import { Manifest, System, file_name } from 'azk/manifest';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');
var path = require('path');

describe("Azk manifest class", function() {

  describe("in a valid azk project folder", function() {
    var project  = h.fixture_path('full_example');
    var manifest = new Manifest(project);

    it("should find manifest in root project folder", function() {
      h.expect(manifest).to.have.property('file', path.join(project, file_name));
      h.expect(manifest).to.have.property('manifestPath', path.join(project));
      h.expect(manifest).to.have.property('manifestDirName', path.basename(project));
    });

    it("should find manifest in subfolder", function() {
      var man = new Manifest(path.join(project, "lib"));
      h.expect(manifest).to.have.property('file', manifest.file);
    });

    it("should parse manifest file", function() {
      h.expect(manifest).to.have.property('systems')
        .and.have.property('front');
    });

    it("should calculate a namespace", function() {
      h.expect(manifest).to.have.property('namespace')
        .and.length(20);
    });

    it("should set a default system", function() {
      h.expect(manifest).to.have.property('systemDefault')
        .and.eql(manifest.system('front'));
    });

    it("should parse systems to System class", function() {
      h.expect(manifest.system('front')).to.instanceof(System);
    });
  });

  describe("in a directory", function() {
    var project;
    before(() => {
      return h.tmp_dir({ prefix: "azk-test-" }).then((dir) => project = dir);
    });

    it("should return not found manifest", function() {
      h.expect(Manifest.find_manifest(project)).to.equal(null);
    });

    it("should be make a fake manifest", function() {
      var manifest = Manifest.makeFake(project, default_img);
      var system   = manifest.systemDefault;
      h.expect(manifest).to.instanceof(Manifest);
      h.expect(manifest).to.have.property("cwd" , project);
      h.expect(manifest).to.have.property("file", path.join(project, config("manifest")));
      h.expect(system).to.have.property("name", "__tmp__");
      h.expect(system).to.have.deep.property("image.name", default_img);
    });
  });
});
