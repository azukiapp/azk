import h from 'spec/spec_helper';
import { async } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';

describe('Azk cli interactive cmds class', function() {
  var outputs = [];
  var UI = h.mockUI(beforeEach, outputs);

  class TestCmd extends InteractiveCmds {
    action(opts) {
      this.verbose_msg(1, 'nivel-1');
      this.verbose_msg(2, 'nivel-2');
      this.verbose_msg(3, () => {
        this.dir('nivel-3');
      });
      this.dir(opts);
    }

    verbose(data) {
      this.dir(data);
    }

    tKeyPath(...keys) {
      return ['test', 'commands', this.name, ...keys];
    }

    run(...args) {
      while (outputs.length > 0) { outputs.pop(); }
      return super.run(...args);
    }
  }

  describe('whith quiet option', function() {
    var cmd = new TestCmd('test_options', UI);

    it('should true', function () {
      return cmd.run(['--quiet']).then(() => {
        h.expect(outputs).to.eql([{ verbose: 0, __leftover: [], quiet: true}]);
      });
    });
  });

  describe('whith verbose option', function() {
    var cmd = new TestCmd('test_options', UI);

    it("should run with verbose outputs", function() {
      return async(this, function* () {
        yield cmd.run([]);
        h.expect(outputs).to.eql([{ verbose: 0, __leftover: [], quiet: false }]);
        yield cmd.run(['--verbose']);
        h.expect(outputs).to.eql(['nivel-1', { verbose: 1, __leftover: [], quiet: false }]);
        yield cmd.run(['--verbose', '-vv']);
        h.expect(outputs).to.eql([
          'nivel-1', 'nivel-2', 'nivel-3',
          { verbose: 3, __leftover: [], quiet: false },
        ]);
      });
    });
  });
});
