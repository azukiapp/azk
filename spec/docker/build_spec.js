import { Q, _, config, defer } from 'azk';
import { Image } from 'azk/images';
import h from 'spec/spec_helper';
import { DockerfileNotFound, DockerBuildError } from 'azk/utils/errors';

var qfs = require('q-io/fs');

describe("Azk docker module, image build @slow", function() {
  this.timeout(20000);

  var rootFolder;

  before(function() {
    return h.tmp_dir().then((dir) => {
      // save root dir
      rootFolder = dir;

      var dockerfilePath = path.join(dir, 'Dockerfile');
      h.touchSync(dockerfilePath);
      var dockerfileContent = [
        'FROM azukiapp/node:0.10',
        'MAINTAINER Azuki <support@azukiapp.com>',
        '',
        'CMD [ "node" ]',
      ].join('\n');
      return qfs.write(dockerfilePath, dockerfileContent);
    });
  });

  before(() => h.remove_images());

  it("should get a dockerfile", function() {
    var img = new Image({ dockerfile: rootFolder });
  });

  it("should raise error to not found dockerfile", function() {
    var result = h.docker.build('not_found', 'not_exist');
    return h.expect(result).to.be.rejectedWith(DockerfileNotFound);
  });
});
