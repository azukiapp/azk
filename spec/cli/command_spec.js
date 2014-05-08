var path = require('path');
import h from 'spec/spec_helper';
import { Command } from 'azk/cli/command';
import {
  InvalidOptionError,
  InvalidValueError,
  RequiredOptionError
} from 'azk/utils/errors';

describe.only('Azk cli command module', function() {
  var outputs = [];
  beforeEach(() => outputs = []);

  var UI = {
    isUI: true,
    dir(...args) {
      outputs.push(...args);
    }
  }

  class TestCmd extends Command {
    action(opts) {
      this.dir(opts);
    }
  }

  describe("with a simple options", function() {
    var cmd = new TestCmd('test_options', UI);
    cmd
      .addOption(['--number' , '-n'], { type: Number, desc: "Number description" })
      .addOption(['--verbose', '-v'], { desc: "Verbose description" })
      .addOption(['--flag'   , '-f'], { desc: "Flag description" })
      .addOption(['--size'], { options: ["small", "big"] });

    it("should parse args and exec", function() {
      cmd.run(['--number', '1', '-fv']);
      h.expect(outputs).to.eql([{ number: 1, verbose: true, flag: true, __leftover: [] }]);
    });

    it("should support --no-option and false value", function() {
      cmd.run(['--no-verbose', '--flag', 'false']);
      h.expect(outputs).to.eql([{verbose: false, flag: false, __leftover: [] }]);
    });

    it("should support --option=value", function() {
      cmd.run(['--number=20']);
      h.expect(outputs).to.eql([{number: 20, __leftover: []}]);
    });

    it("should support valid options", function() {
      cmd.run(['--size', 'small']);
      h.expect(outputs).to.deep.property("[0].size", "small");

      var func = () => cmd.run(['--size', 'invalid_value']);
      h.expect(func).to.throw(InvalidValueError, /invalid_value.*size/);
    });

    it("should raise a invalid option", function() {
      h.expect(() => cmd.run(['--invalid'])).to.throw(InvalidOptionError);
    });
  });

  describe("with a sub commands and options", function() {
    var cmd = new TestCmd('test_sub {sub_command} [sub_command_opt]', UI);
    cmd.addOption(['--string', '-s'], {
      required: true, type: String, desc: "String description"
    });

    it("should be parse subcommand option", function() {
      cmd.run(['command1', 'command2', '--string', 'foo']);
      h.expect(outputs).to.eql([{
        sub_command: "command1",
        sub_command_opt: "command2",
        string: "foo",
        __leftover: []
      }]);
    });

    it("should be raise a required option", function() {
      var func = () => cmd.run([]);
      h.expect(func).to.throw(RequiredOptionError, /string/);

      var func = () => cmd.run(['--string=value']);
      h.expect(func).to.throw(RequiredOptionError, /sub_command/);
    });
  });

  describe("with a validate subcommand", function() {
    var cmd = new TestCmd('test_sub {*sub_command}', UI);
    cmd.addOption(['--string', '-s'], {
      type: String, desc: "String description"
    });
    cmd.addOption(['--flag']);

    it("should capture any think after sub_command", function() {
      cmd.run(['--string', 'foo', 'subcommand', "--sub-options"]);
      h.expect(outputs).to.eql([{
        sub_command: "subcommand",
        string: "foo",
        __leftover: ["--sub-options"]
      }]);
    });

    it("should capture any think even if a flag is used", function() {
      cmd.run(['--string', 'foo', '--flag', 'subcommand', "--sub-options"]);
      h.expect(outputs).to.eql([{
        sub_command: "subcommand",
        string: "foo",
        flag: true,
        __leftover: ["--sub-options"]
      }]);
    });
  });

  it("should raise directly command use", function() {
    var cmd  = new Command('test', UI);
    h.expect(() => cmd.run()).to.throw(Error, /Don't use/);
  });
});

