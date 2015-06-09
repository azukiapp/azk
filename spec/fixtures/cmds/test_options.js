import { CliController } from 'cli-router';
import { promiseResolve } from 'azk/utils/promises';

class TestOptions extends CliController {
  index(params={}) {
    return promiseResolve([{ number: params.number }]);
  }
}

module.exports = TestOptions;
