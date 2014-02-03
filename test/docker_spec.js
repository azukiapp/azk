var helper = require('./spec_helper.js');
var docker = require('../lib/docker');

var expect = helper.expect;

describe("Azk docker client", function() {
  it("should use constants options", function(done) {
    var result = docker.info(function(err, info) {
      expect(err).to.be.null;
      expect(info).to.have.property('Containers')
        .that.is.an('Number')
      done()
    })
  })
})
