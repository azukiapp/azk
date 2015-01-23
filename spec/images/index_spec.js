import { config } from 'azk';
import { Image } from 'azk/images';
import h from 'spec/spec_helper';
import { ManifestError } from 'azk/utils/errors';

var path = require('path');

describe("Azk image class", function() {
  this.timeout(20000);
  before(() => h.remove_images());

  describe("in new image", function() {
    describe("by a hash info", function() {
      it("should parse without tag", function() {
        var img = new Image({ provider: "docker", repository: "azukiapp/image" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "latest");
        h.expect(img).to.have.property("name", "azukiapp/image:latest");
        h.expect(img).to.have.property("provider", "docker");
      });

      it("should parse with a tag", function() {
        var img = new Image({ provider: "docker", repository: "azukiapp/image", tag: "0.0.1" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "0.0.1");
        h.expect(img).to.have.property("provider", "docker");
      });

      it("should parse with a provider", function() {
        var img = new Image({ provider: "docker", repository: "azukiapp/image", tag: "0.0.1" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "0.0.1");
        h.expect(img).to.have.property("provider", "docker");
      });

      it("should throw an error with an invalid provider", function() {
        var func = () => new Image({ provider: "MyInexistentProvider", repository: "azukiapp/image", tag: "0.0.1" });
        h.expect(func).to.throw(ManifestError);
      });

      it("should parse with provider in key", function() {
        var img = new Image({ docker: "azukiapp/image:0.0.1" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "0.0.1");
        h.expect(img).to.have.property("provider", "docker");
      });

      it("should parse with provider in key without tag", function() {
        var img = new Image({ docker: "azukiapp/image" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "latest");
        h.expect(img).to.have.property("provider", "docker");
      });
    });

    describe("with a dockerfile", function() {
      var system = { image_name_suggest: 'suggest' };
      it("should parse in the short form", function() {
        var dockerfile = path.join(h.fixture_path('build'));
        var img = new Image({ dockerfile, system });
        h.expect(img).to.have.property("provider", "dockerfile");
        h.expect(img).to.have.property("path", path.join(dockerfile, 'Dockerfile'));
      });

      it("should parse with the hashes", function() {
        var dockerfile = path.join(h.fixture_path('build'), 'DockerfileInvalid');
        var img = new Image({ provider: "dockerfile", path: dockerfile, system });
        h.expect(img).to.have.property("provider", "dockerfile");
        h.expect(img).to.have.property("path", dockerfile);
        h.expect(img).to.have.property("name").and.match(/suggest/);
      });
    });

    describe("by another image", function() {
      it("should return same image", function() {
        var img  = new Image({ provider: "docker", repository: "azukiapp/image" });
        var img2 = new Image(img);
        h.expect(img2).to.eql(img);
      });
    });
  });

  describe("new image", function() {
    var img = new Image({ docker: config("docker:image_empty")});

    it("should check image is avaible", function() {
      return h.expect(img.check()).to.eventually.equal(null);
    });
  });
});
