import { Q, config } from 'azk';
import h from 'spec/spec_helper';

var default_img = config('docker:image_default');

describe("Azk docker client", function() {
  this.timeout(20000);

  it("should use constants options", function() {
    return h.expect(h.docker.info())
      .to.eventually.have.property("Containers")
      .and.is.an('Number');
  })

  it("should get a image", function() {
    var image = h.docker.getImage(default_img);
    h.expect(image.name).to.equal(default_img);

    return h.expect(image.inspect())
      .to.eventually.have.property("Id")
      .and.is.an("String");
  });

  describe("finders", function() {
    it("should get and inspect image by name", function() {
      var image = h.docker.findImage(default_img);
      return h.expect(image).to.eventually.has.property("name", default_img);
    });

    it("should get and return null if not exist image", function() {
      return h.expect(h.docker.findImage("not_exist"))
        .to.eventually.not.exist;
    });

    it("should get and inspect a container by id", function() {
      var result = h.docker.run(default_img,
        ["/bin/bash", "-c", "exit" ],
        { }
      );

      return result.then((container) => {
        var id = container.id;
        return h.docker.findContainer(id).then((container) => {
          h.expect(container).to.have.property('id', id);
        });
      });
    });

    it("should get and return null if not exist container", function() {
      return h.expect(h.docker.findContainer("not_exist"))
        .to.eventually.not.exist;
    });
  });
})

