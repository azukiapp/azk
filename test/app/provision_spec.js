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
  afterEach(remove);

  it("should return a error if image from not exist", function() {
    return expect(provision("not_exist"))
      .to.eventually.rejectedWith(errors.ImageNotExistError, /not_exist/)
  });

  describe("if from is valid image", function() {
    var project = __dirname;
    var stdout, output;

    beforeEach(function() {
      stdout = new MemoryStream();
      output = '';
      stdout.on('data', function(data) {
        output += data.toString();
      });
    });

    it("should generate Dockerfile and build image", function() {
      var steps = [
        "# comment",
        "echo 'azk' > /azk",
        ["run", ["/bin/bash", "-c", 'cat "/azk"']],
        ["add", "provision_spec.js", "/provision_spec.js"],
        ["run", ["cat", "/provision_spec.js"]],
      ];

      var result = (Q.async(function* () {
        var prov = yield provision(
          "ubuntu:12.04", provision_image, project, stdout,
          {steps: steps, verbose: true, cache: false }
        );

        expect(output).to.match(/FROM ubuntu:12.04/);
        expect(output).to.match(/RUN # comment/);
        expect(output).to.match(/RUN echo 'azk' > \/azk/);
        expect(output).to.match(/RUN \/bin\/bash -c "cat \\"\/azk\\""/);
        expect(output).to.match(/ADD provision_spec.js \/provision_spec.js/);
        expect(output).to.match(/match_with_this/);

        return yield docker.getImage(provision_image).inspect();
      }))();

      return expect(result).to.eventually.has.property("id");
    });

    it("should raise error if add a invalid file", function() {
      var steps  = [["add", "invalid", "/file"]]
      var result = (Q.async(function* () {
        yield provision(
          "ubuntu:12.04", provision_image, project, stdout,
          {steps: steps, verbose: true, cache: false }
        );
      }))();

      return expect(result).to.eventually
        .rejectedWith(azk.errors.InvalidFileError, /invalid/);
    });
  });
});
