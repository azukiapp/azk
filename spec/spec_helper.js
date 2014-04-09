require('source-map-support').install();

import { Q, Azk, pp, _, config } from 'azk';
import docker from 'azk/docker';
import Utils from 'azk/utils';
import { set as configSet } from 'azk/config';

var chai = require('chai');
var tmp  = require('tmp');
var path = require('path');

// Chai extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));

import capture_io from 'azk/utils/capture_io'
var MemoryStream  = require('memorystream');

var Helpers = {
  pp: pp,
  capture_io: capture_io,
  tmp_dir: Q.denodeify(tmp.dir),
  expect : chai.expect,

  fixture_path(fixture) {
    return Utils.resolve(
      '.', 'spec', 'fixtures', fixture
    );
  },

  makeMemoryStream(...args) {
    return new MemoryStream(...args);
  },

  escapeRegExp(value) {
    return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }
}

// Remove all containers before run
before(function() {
  console.log("Before all tasks:");
  this.timeout(0);
  var regex = RegExp(`\/${Helpers.escapeRegExp(config('docker:namespace'))}`);

  var result = Q.async(function* () {
    var containers = yield docker.listContainers({ all: true });
    containers = _.filter(containers, (container) => {
      return container.Names[0].match(regex);
    });
    console.log(" - Removing %s containers before run tests", containers.length);
    return Q.all(_.map(containers, (container) => {
      return docker.getContainer(container.Id).remove({ force: true });
    }));
  })();

  return result.then(() => console.log("\n"));
});

// Helpers
require('spec/spec_helpers/mock_outputs').extend(Helpers);

export default Helpers;
