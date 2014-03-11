var azk    = require('../../lib/azk');
var h      = require('../spec_helper');
var docker = require('../../lib/docker');

var errors = azk.errors;
var Q = azk.Q;

var provision = require('../../lib/app/provision');

describe("Azk app provision module", function() {
  var provision_image = "azk-test-provision";
  var image = docker.getImage(provision_image)

  it("should return a error if image from not exist", function() {
    return h.expect(provision("not_exist"))
      .to.eventually.rejectedWith(errors.ImageNotExistError, /not_exist/)
  });

  describe("if from is valid image", function() {
    this.timeout(0);
    var project = __dirname;
    var stdout, output;

    beforeEach(function() {
      stdout = new h.MemoryStream();
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
          azk.cst.DOCKER_DEFAULT_IMG, provision_image, project, stdout,
          {steps: steps, verbose: true, cache: false }
        );

        h.expect(output).to.match(RegExp("FROM " + h.escapeRegExp(azk.cst.DOCKER_DEFAULT_IMG)));
        h.expect(output).to.match(/RUN # comment/);
        h.expect(output).to.match(/RUN echo 'azk' > \/azk/);
        h.expect(output).to.match(/RUN \/bin\/bash -c "cat \\"\/azk\\""/);
        h.expect(output).to.match(/ADD provision_spec.js \/provision_spec.js/);
        h.expect(output).to.match(/RUN cat \/provision_spec.js/);

        return yield docker.getImage(provision_image).inspect();
      }))();

      return h.expect(result).to.eventually.has.property("id");
    });

    it("should raise error if add a invalid file", function() {
      var steps  = [["add", "invalid", "/file"]]
      var result = (Q.async(function* () {
        yield provision(
          azk.cst.DOCKER_DEFAULT_IMG, provision_image, project, stdout,
          {steps: steps, verbose: true, cache: false }
        );
      }))();

      return h.expect(result).to.eventually
        .rejectedWith(azk.errors.InvalidFileError, /invalid/);
    });
  });
});
