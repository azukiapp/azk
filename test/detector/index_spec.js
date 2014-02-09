var helper = require('../spec_helper.js');
var expect = helper.expect;
var touch  = require('touch');
var path   = require('path');
var fs     = require('fs');

var detect = require('../../lib/detector');
var cst = helper.azk.cst;

describe.only("Azk cli detect tool", function() {
    var app_dir = null;
    var box_dir = null;

  it("should detect project type for path", function() {
    return helper.tmp.dir({ prefix: "azk-" })
    .then(function(project) {
      touch.sync(path.join(project, "Gemfile"));

      var detected = detect.inspect(project)
      expect(detected).to.have.property("box")
        .and.match(/ruby/);

      touch.sync(path.join(project, "package.json"));

      var detected = detect.inspect(project)
      expect(detected).to.have.property("box")
        .and.match(/node/);
    });
  })

  it("should format template", function() {
    return helper.tmp.dir({ prefix: "azk-" })
    .then(function(project) {
      var manifest = path.join(project, cst.MANIFEST);
      touch.sync(path.join(project, "Gemfile"));

      var detected = detect.inspect(project)
      detect.render(detected, manifest);

      var data = fs.readFileSync(manifest);
      expect(data).to.match(/box/);
    });
  })
})

