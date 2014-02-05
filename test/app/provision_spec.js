var azk    = require('../../lib/azk');
var helper = require('../spec_helper.js');
var docker = require('../../lib/docker');
var MemoryStream = require('memorystream');

var expect = helper.expect;
var errors = azk.errors;
var Q = azk.Q;

var provision = require('../../lib/app/provision');

describe("Azk app provision module", function() {
  it("should return a error if image from not exist", function() {
    return expect(provision("not_exist"))
      .to.eventually.rejectedWith(errors.ImageNotExistError, /not_exist/)
  });

  it("should generate and build docker image", function() {
    var memStream = new MemoryStream();
    var output = '';

    var image = "azk-test";
    var steps = [
      "echo 'azk' > /azk",
    ];

    memStream.on('data', function(data) {
      output += data;
    });

    var result = (Q.async(function* () {
      var prov = yield provision(
        "ubuntu:12.04", image, memStream, { steps: steps }
      );

      expect(output).to.match(/FROM ubuntu:12.04/);
      expect(output).to.match(/RUN echo 'azk' > \/azk/);

      return yield docker.getImage(image).inspect();
    }))();

    return expect(result).to.eventually.has.property("id");
  });
});
