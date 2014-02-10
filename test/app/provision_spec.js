var azk    = require('../../lib/azk');
var helper = require('../spec_helper.js');
var docker = require('../../lib/docker');
var MemoryStream = require('memorystream');

var expect = helper.expect;
var errors = azk.errors;
var Q = azk.Q;

var provision = require('../../lib/app/provision');

describe("Azk app provision module", function() {
  var provision_image = "azk-test";
  var image = docker.getImage(provision_image)

  var remove = function() {
    return image.inspect().then(function() {
      return image.remove();
    }, function() {});
  }

  before(remove);
  after(remove);

  it("should return a error if image from not exist", function() {
    return expect(provision("not_exist"))
      .to.eventually.rejectedWith(errors.ImageNotExistError, /not_exist/)
  });

  it("should generate Dockerfile and build image", function() {
    var memStream = new MemoryStream();
    var output = '';

    var steps = [
      "echo 'azk' > /azk",
      ["run", ["/bin/bash", "-c", 'cat "/azk"']],
      ["add", __filename, "/provision_spec.js"],
    ];

    memStream.on('data', function(data) {
      output += data;
    });

    var result = (Q.async(function* () {
      var prov = yield provision(
        "ubuntu:12.04", provision_image, memStream,
        {steps: steps, verbose: true, cache: false }
      );

      //console.log(output);
      expect(output).to.match(/FROM ubuntu:12.04/);
      expect(output).to.match(/RUN echo 'azk' > \/azk/);
      expect(output).to.match(/RUN \/bin\/bash -c "cat \\"\/azk\\""/);
      expect(output).to.match(/ADD .*\/provision_spec.js \/provision_spec.js/);

      return yield docker.getImage(provision_image).inspect();
    }))();

    return expect(result).to.eventually.has.property("id");
  });
});
