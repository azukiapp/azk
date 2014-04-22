import { Q, _ } from 'azk/utils'

var StdOutFixture = require('fixture-stdout');

var fixtures = {
  stdout: new StdOutFixture(),
  stderr: new StdOutFixture({ stream: process.stderr }),
}

function capture_io(block) {
  return Q.when(null, () => {
    var writes = { stdout: '', stderr: '' };

    // Capture a write to stdout
    _.each(fixtures, (fixture, key) => {
      fixture.capture((string, encoding, fd) => {
        writes[key] += string;
        return false;
      });
    });

    var fail = (err) => {
      _.each(fixtures, (fixture) => fixture.release());
      throw err;
    }

    try {
      var result = block();
    } catch (err) { return fail(err) };

    return Q.when(result, (value) => {
      _.each(fixtures, (fixture) => fixture.release());
      return [value, writes];
    }, fail);
  });
}

export default capture_io;
