require('source-map-support').install();

import { Q, config, Azk } from 'azk';
import Utils from 'azk/utils';

var chai = require('chai');
var tmp  = require('tmp');
var path = require('path');

// Chai extensions
require("mocha-as-promised")();
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));

var Helpers = {
  fixture_path(fixture) {
    return Utils.resolve(
      '.', 'spec', 'fixtures', fixture
    );
  },
  tmp_dir: Q.denodeify(tmp.dir),
  expect : chai.expect,
}

export default Helpers;
