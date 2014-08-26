import { Q, _, config, defer } from 'azk';
import docker from 'azk/docker';
import { Image } from 'azk/docker';
import h from 'spec/spec_helper';
import { ProvisionNotFound, ProvisionPullError } from 'azk/utils/errors';

var image_empty = config('docker:image_empty');

describe("Azk docker module, image pull @slow", function() {
  this.timeout(20000);
  before(() => h.remove_images());

  it("should get a image by name", function() {
    var image  = Image.parseRepositoryTag(image_empty);
    var events = [];
    return docker.pull(image.repository, image.tag)
      .progress((event) => events.push(event))
      .then(() => {
        var status = [
          'pulling_repository',
          'pulling_layers',
          'pulling_metadata',
          'pulling_fs_layer',
          'pulling_image',
          'download',
          'download_complete',
        ];
        _.each(status, (status) => {
          h.expect(events)
            .to.contain.an.item.with.deep.property('statusParsed.type', status);
        });
      });
  });

  it("should raise error to not found image", function() {
    var result = docker.pull('not_found', 'not_exist');
    return h.expect(result).to.be.rejectedWith(ProvisionNotFound);
  });

  it("should raise error to internal error", function() {
    var result = docker.pull('http://127.0.0.1/invalid', 'not_exist');
    return h.expect(result).to.be.rejectedWith(Error, /500/);
  });
});
