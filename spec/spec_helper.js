require('source-map-support').install();

import { Q, config, Azk, pp, _ } from 'azk';
import docker from 'azk/docker';
import Utils from 'azk/utils';

var chai = require('chai');
var tmp  = require('tmp');
var path = require('path');

// Chai extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));

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
  }
}

// Remove all containers before run
before(function() {
  console.log("Before all tasks:");
  this.timeout(0);

  var result = Q.async(function* () {
    var containers = yield docker.listContainers({ all: true });
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
