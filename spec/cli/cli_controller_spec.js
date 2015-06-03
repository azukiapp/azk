import h from 'spec/spec_helper';
import { CliController } from 'azk/cli/cli_controller';
import { promiseResolve } from 'azk/utils/promises';

describe('Azk cli controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  class TestCliController extends CliController {
    index(opts) {
      this.verbose_msg(1, 'nivel-1');
      this.verbose_msg(2, 'nivel-2');
      this.verbose_msg(3, () => {
        this.ui.dir('nivel-3');
      });
      this.ui.dir(opts);
      return promiseResolve(0);
    }

    verbose(data) {
      this.ui.dir(data);
    }

    run(...args) {
      while (outputs.length > 0) { outputs.pop(); }
      return super.run_action(...args);
    }
  }

  var run_options = { ui: ui, cwd: __dirname };
  var cmd = new TestCliController(run_options);

  describe('whith quiet option', function() {
    it('should true', function () {
      return cmd.run({ quiet: true, verbose: 0 }).then(() => {
        h.expect(outputs).to.eql([{ quiet: true, verbose: 0}]);
      });
    });
  });

  describe('whith verbose option', function() {
    it("should run with verbose outputs, level 0", function() {
      return cmd.run({ quiet: false, verbose: 0 }).then(() => {
        h.expect(outputs).to.eql([{ quiet: false, verbose: 0}]);
      });
    });

    it("should run with verbose outputs, level 1", function() {
      return cmd.run({ quiet: false, verbose: 1 }).then(() => {
        h.expect(outputs).to.eql(['nivel-1', { verbose: 1, quiet: false }]);
      });
    });

    it("should run with verbose outputs, level 2", function() {
      return cmd.run({ quiet: false, verbose: 2 }).then(() => {
        h.expect(outputs).to.eql(['nivel-1', 'nivel-2', { verbose: 2, quiet: false }]);
      });
    });

    it("should run with verbose outputs, level 3", function() {
      return cmd.run({ quiet: false, verbose: 3 }).then(() => {
        h.expect(outputs).to.eql(['nivel-1', 'nivel-2', 'nivel-3', { verbose: 3, quiet: false } ]);
      });
    });
  });
});
