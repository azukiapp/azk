require('source-map-support').install();

import { Q, config, Azk, pp, _ } from 'azk';
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

// Helpers
require('spec/spec_helpers/mock_outputs').extend(Helpers);

export default Helpers;
