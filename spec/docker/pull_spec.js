import { config } from 'azk';
import { subscribe } from 'azk/utils/postal';
import { Image } from 'azk/docker';
import h from 'spec/spec_helper';
import { ProvisionNotFound } from 'azk/utils/errors';

var image_empty = config('docker:image_empty');

describe("Azk docker module, image pull @slow", function() {
  this.timeout(50000);
  before(() => h.remove_images());

  it("should get a image by name", function() {
    var image  = Image.parseRepositoryTag(image_empty);
    var events = [];

    var _subscription = subscribe('docker.pull.status', (data) => {
      events.push(data);
    });

    return h.docker.pull(image.repository, image.tag)
      .then(() => {
        _subscription.unsubscribe();
        h.expect(events).to.contain.an.item.with.deep.property('statusParsed.type', "pulling_finished");
        h.expect(events).to.contain.an.item.with.deep.property('end').and.to.ok;
      })
      .catch(function (err) {
        _subscription.unsubscribe();
        throw err;
      });
  });

  it("should raise error to not found image", function() {
    var result = h.docker.pull('not_found', 'not_exist');
    return h.expect(result).to.be.rejectedWith(ProvisionNotFound);
  });

  it("should raise error to internal error", function() {
    var result = h.docker.pull('scratch', 'not_exist');
    return h.expect(result).to.be.rejectedWith(Error, /500/);
  });
});
