import { config } from 'azk';
import { Image } from 'azk/images';
import h from 'spec/spec_helper';

var path = require('path');

describe("Azk image class", function() {
  this.timeout(20000);
  before(() => h.remove_images());

  describe("in new image", function() {
    describe("by a string name", function() {
      it("should parse withou tag", function() {
        var img = new Image("azukiapp/image");
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "latest");
        h.expect(img).to.have.property("name", "azukiapp/image:latest");
      });
      it("should parse with tag", function() {
        var img = new Image("azukiapp/image:0.1.0");
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "0.1.0");
      });
    });

    describe("by a hash info", function() {
      it("should parse withou tag", function() {
        var img = new Image({ repository: "azukiapp/image" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "latest");
        h.expect(img).to.have.property("name", "azukiapp/image:latest");
      });

      it("should parse withou tag", function() {
        var img = new Image({ repository: "azukiapp/image", tag: "0.0.1" });
        h.expect(img).to.have.property("repository", "azukiapp/image");
        h.expect(img).to.have.property("tag", "0.0.1");
      });
    });

    describe("by another image", function() {
      it("should return same image", function() {
        var img  = new Image({ repository: "azukiapp/image" });
        var img2 = new Image(img);
        h.expect(img2).to.eql(img);
      });
    });
  });

  describe("new image", function() {
    var img = new Image(config("docker:image_empty"));

    it("should check image is avaible", function() {
      return h.expect(img.check()).to.eventually.equal(null);
    });

    it("pull a image @slow", function() {
      var events = [];
      return img.pull().progress((event) => events.push(event))
        .then(() => {
          h.expect(events)
            .to.contain.an.item.with
            .deep.property('statusParsed.type', 'download_complete');
        });
    });
  });
});
