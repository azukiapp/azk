import { CliController } from 'cli-router';

class TestOptions extends CliController {
  index(params={}) {
    return [{ number: params.number }];
  }
}

module.exports = TestOptions;
