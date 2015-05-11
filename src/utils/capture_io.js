import { _ } from 'azk/utils';
import { promiseResolve } from 'azk/utils/promises';

var StdOutFixture = require('fixture-stdout');

var fixtures = {
  stdout: new StdOutFixture(),
  stderr: new StdOutFixture({ stream: process.stderr }),
};

function capture_io(block) {
  return promiseResolve(null).then(() => {
    var writes = { stdout: '', stderr: '' };
    var result;

    // Capture a write to stdout
    _.each(fixtures, (fixture, key) => {
      fixture.capture((string) => {
        writes[key] += string;
        return false;
      });
    });

    var fail = (err) => {
      _.each(fixtures, (fixture) => fixture.release());
      throw err;
    };

    try {
      result = block();
    } catch (err) { return fail(err); }

    return promiseResolve(result).then((value) => {
      _.each(fixtures, (fixture) => fixture.release());
      return [value, writes];
    }, fail);
  });
}

export { capture_io };
export default capture_io;
