require('source-map-support').install();

import { Q, Azk } from 'azk';
export { expect } from 'chai';

var tmp  = require('tmp');
var path = require('path');

export function fixture_path(fixture) {
  return path.join(
    __dirname, 'fixtures', fixture
  );
}

var tmp_dir = Q.denodeify(tmp.dir);
export { tmp_dir };
