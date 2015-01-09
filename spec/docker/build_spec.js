import { Q, _, config, defer, path, fs } from 'azk';
import { Image } from 'azk/images';
import h from 'spec/spec_helper';
import { DockerfileNotFound, DockerBuildError } from 'azk/utils/errors';

var qfs = require('q-io/fs');

describe("Azk docker module, image build @slow", function() {
  this.timeout(20000);

  var rootFolder;

  before(function() {
    return h.remove_images()
      .then(h.tmp_dir)
      .then((dir) => {
      // save root dir
      rootFolder = dir;

      /*
        create a folder structure like this:
        -----------------------------------
        ./Dockerfile
        ./file_to_add
        ./dir_to_add/some_other_file_inside
      */
      var dockerfilePath = path.join(dir, 'Dockerfile');
      h.touchSync(dockerfilePath);

      var file_to_add_filePath = path.join(dir, 'file_to_add');
      h.touchSync(file_to_add_filePath);

      var dir_to_add = path.join(dir, 'dir_to_add');
      fs.mkdirSync(dir_to_add);
      var  some_other_file_inside = path.join(dir, 'dir_to_add', 'some_other_file_inside');
      h.touchSync(some_other_file_inside);

      var dockerfileContent = [
        'FROM azukiapp/azktcl:0.0.1',
        'MAINTAINER Azuki <support@azukiapp.com>',
        'ADD ./file_to_add /file_to_add',
        'ADD ./dir_to_add /dir_to_add',
      ].join('\n');

      return qfs.write(dockerfilePath, dockerfileContent);
    });
  });

  it("should get a dockerfile", function() {
    var img = new Image({ dockerfile: rootFolder, name: config('docker:repository') });

    var events = [];
    return img.build()
      .progress((event) => events.push(event))
      .then(() => {

        var status = [
          'building_from',
          'building_maintainer',
          'building_complete',
        ];
        _.each(status, (status) => {
          h.expect(events)
            .to.contain.an.item.with.deep.property('statusParsed.type', status);
        });
      });
  });

  // it("should raise error to not found dockerfile", function() {
  //   var result = h.docker.build('not_found', 'not_exist');
  //   return h.expect(result).to.be.rejectedWith(DockerfileNotFound);
  // });

  // it("should raise error to internal error", function() {
  //   var result = h.docker.build('http://127.0.0.1/invalid', 'not_exist');
  //   return h.expect(result).to.be.rejectedWith(Error, /500/);
  // });
});
