var path = require('path');
import h from 'spec/spec_helper';
import { Command } from 'azk/cli/command';
import {
  InvalidOptionError,
  InvalidValueError,
  RequiredOptionError
} from 'azk/utils/errors';

describe.only('Azk cli command module', function() {
  var cmds = path.join(__dirname, '../fixtures/cmds');
  var userInt = {
    dir(...args) {
      outputs.push(...args);
    }
  }
  var cmd = new Command("azk-test", userInt, cmds);
  //cli.addOption('debug', 'd', Boolean, "Debug description");
  //cli.addOption('verbose', 'v', Boolean, "Verbose description");
  var outputs = [];

  beforeEach(() => outputs = []);

  it("should load and connect commands", function() {
    h.expect(cmd).have.deep.property('commands.test_options')
      .and.instanceOf(Command);
  });

  describe("options support", function() {
    it("should parse args and exec", function() {
      cmd.run(['test_options', '--number', '1', '-fv']);
      h.expect(outputs).to.eql([{ number: 1, verbose: true, flag: true, __leftover: [] }]);
    });

    it("should support --no-option and false value", function() {
      cmd.run(['test_options', '--no-verbose', '--flag', 'false']);
      h.expect(outputs).to.eql([{verbose: false, flag: false, __leftover: [] }]);
    });

    it("should support --option=value", function() {
      cmd.run(['test_options', '--number=20']);
      h.expect(outputs).to.eql([{number: 20, __leftover: []}]);
    });

    it("should be parse subcommand option", function() {
      cmd.run(['test_sub', 'command1', 'command2', '--string', 'foo']);
      h.expect(outputs).to.eql([{
        sub_command: "command1",
        sub_command_opt: "command2",
        string: "foo",
        __leftover: []
      }]);
    });

    it("should support valid options", function() {
      cmd.run(['test_options', '--size', 'small']);
      h.expect(outputs).to.deep.property("[0].size", "small");

      var func = () => cmd.run(['test_options', '--size', 'invalid_value']);
      h.expect(func).to.throw(InvalidValueError, /invalid_value.*size/);
    });

    it("should raise a invalid command", function() {
      var func = () => cmd.run(['invalid_cmd']);
      h.expect(func).to.throw(InvalidValueError, /invalid_cmd.*command/);
    });

    it("should raise a invalid option", function() {
      h.expect(() => cmd.run(['test_options', '--invalid'])).to.throw(InvalidOptionError);
    });

    it("should be raise a required option", function() {
      var func = () => cmd.run(['test_sub']);
      h.expect(func).to.throw(RequiredOptionError, /string/);

      var func = () => cmd.run(['test_sub', '--string=value']);
      h.expect(func).to.throw(RequiredOptionError, /sub_command/);
    });
  });
});

