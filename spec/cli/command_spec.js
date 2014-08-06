import h from 'spec/spec_helper';
import { _, t, path } from 'azk';
import { Command, UI as OriginalUI } from 'azk/cli/command';
import {
  InvalidOptionError,
  InvalidValueError,
  RequiredOptionError
} from 'azk/utils/errors';

var printf = require('printf');

describe('Azk cli command class', function() {
  var outputs = [];
  var UI = h.mockUI(beforeEach, outputs);

  class TestCmd extends Command {
    action(opts) {
      this.dir(opts);
    }

    tKeyPath(...keys) {
      return ['test', 'commands', this.name, ...keys];
    }

    run(...args) {
      while(outputs.length > 0) { outputs.pop(); }
      return super(...args);
    }
  }

  describe("with a simple options", function() {
    var cmd = new TestCmd('test_options', UI)
      .addOption(['--verbose', '-v'])
      .addOption(['--flag'   , '-f'])
      .addOption(['--number' , '-n'], { type: Number })
      .addOption(['--size'], { options: ["small", "big"] })
      .addOption(['--array'], { type: String, acc: true });

    it("should parse args and exec", function() {
      cmd.run(['--number', '1', '-fv']);
      h.expect(_.clone(outputs)).to.eql([{
        number: 1, verbose: true, flag: true, __leftover: []
      }]);
    });

    it("should support --no-option and false value", function() {
      cmd.run(['--no-verbose', '--flag', 'false']);
      h.expect(_.clone(outputs)).to.eql([{
        verbose: false, flag: false, __leftover: []
      }]);
    });

    it("should support --option=value", function() {
      cmd.run(['--number=20']);
      h.expect(_.clone(outputs)).to.eql([{number: 20, __leftover: []}]);
    });

    it("should support valid options", function() {
      cmd.run(['--size', 'small']);
      h.expect(_.clone(outputs)).to.deep.property("[0].size", "small");

      var func = () => cmd.run(['--size', 'invalid_value']);
      h.expect(func).to.throw(InvalidValueError, /invalid_value.*size/);
    });

    it("should raise a invalid option", function() {
      h.expect(() => cmd.run(['--invalid'])).to.throw(InvalidOptionError);
    });
  });

  describe("with a accumulation option", function() {
    var cmd = new TestCmd('test_options', UI)
      .addOption(['--array'], { type: String, acc: true })
      .addOption(['--verbose', '-v'], { type: Boolean, acc: true, default: false });

    it("should return a array of the string", function() {
      cmd.run(['--array', 'item1', '--array', 'item2']);
      h.expect(_.clone(outputs)).to.eql([{
        array: ['item1', 'item2'], verbose: 0, __leftover: []
      }]);
    });

    it("shuld return a nivel for boolean acc option", function() {
      cmd.run([]);
      h.expect(_.clone(outputs)).to.eql([{ verbose: 0, __leftover: [] }]);
      cmd.run(['--verbose']);
      h.expect(_.clone(outputs)).to.eql([{ verbose: 1, __leftover: [] }]);
      cmd.run(['--verbose', '-v']);
      h.expect(_.clone(outputs)).to.eql([{ verbose: 2, __leftover: [] }]);
      cmd.run(['--verbose', '-vv']);
      h.expect(_.clone(outputs)).to.eql([{ verbose: 3, __leftover: [] }]);
    });
  });

  describe("with options that have default values", function() {
    var cmd = new TestCmd('test_options', UI);
    cmd
      .addOption(['--verbose', '-v'], { default: false })
      .addOption(['--flag'   , '-f'], { default: true })

    it("should render a defaults values", function() {
      cmd.run();
      h.expect(_.clone(outputs)).to.deep.property("[0].verbose", false);
      h.expect(_.clone(outputs)).to.deep.property("[0].flag", true);
    });

    it("should replace default values", function() {
      cmd.run(["--verbose", "--no-flag"]);
      h.expect(_.clone(outputs)).to.deep.property("[0].verbose", true);
      h.expect(_.clone(outputs)).to.deep.property("[0].flag", false);
    });
  });

  describe("with a sub commands and options", function() {
    var cmd = new TestCmd('test_sub {sub_command} [sub_command_opt]', UI);
    cmd.setOptions('sub_command', { options: ['command1', 'command2'] });
    cmd.addOption(['--string', '-s'], { required: true, type: String });
    cmd.addOption(['--flag', '-f']);

    it("should be parse subcommand option", function() {
      cmd.run(['command1', 'command2', '--string', 'foo']);
      h.expect(_.clone(outputs)).to.eql([{
        sub_command: "command1",
        sub_command_opt: "command2",
        string: "foo",
        __leftover: []
      }]);
    });

    it("should support flag merged with subcommand", function() {
      cmd.run(["--flag", "command1", '--string', 'foo']);
      h.expect(_.clone(outputs)).to.deep.property("[0].sub_command", "command1");
      h.expect(_.clone(outputs)).to.deep.property("[0].flag", true);

      cmd.run(["--flag", "true", "command1", '--string', 'foo']);
      h.expect(_.clone(outputs)).to.deep.property("[0].sub_command", "command1");
      h.expect(_.clone(outputs)).to.deep.property("[0].flag", true);

      cmd.run(["--flag", "false", "command1", '--string', 'foo']);
      h.expect(_.clone(outputs)).to.deep.property("[0].sub_command", "command1");
      h.expect(_.clone(outputs)).to.deep.property("[0].flag", false);

      cmd.run(["--no-flag", "command1", '--string', 'foo']);
      h.expect(_.clone(outputs)).to.deep.property("[0].sub_command", "command1");
      h.expect(_.clone(outputs)).to.deep.property("[0].flag", false);
    });

    it("should be raise a required option", function() {
      var func = () => cmd.run([]);
      h.expect(func).to.throw(RequiredOptionError, /string/);

      var func = () => cmd.run(['--string=value']);
      h.expect(func).to.throw(RequiredOptionError, /sub_command/);
    });

    it("should support valid options", function() {
      cmd.run(['command2', '--string', 'foo']);
      h.expect(_.clone(outputs)).to.deep.property("[0].sub_command", "command2");

      var func = () => cmd.run(['invalid_value', '--string', 'foo']);
      h.expect(func).to.throw(InvalidValueError, /invalid_value.*sub_command/);
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
      h.expect(_.clone(outputs)).to.eql([{
        sub_command: "subcommand",
        string: "foo",
        __leftover: ["--sub-options"]
      }]);
    });

    it("should capture any think even if a flag is used", function() {
      cmd.run(['--string', 'foo', '--flag', 'subcommand', "--sub-options"]);
      h.expect(_.clone(outputs)).to.eql([{
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

  describe("call showUsage", function() {
    it("should a usage and help options", function() {
      var cmd = new TestCmd('test_help {subcommand} [command]', UI);
      cmd
        .addOption(['--verbose', '-v'], { acc: true, default: false } )
        .addOption(['--flag-default', '-F'], { default: true })
        .addOption(['--flag', '-f'])
        .addOption(['--string'], { type: String })
        .setOptions("subcommand", { options: ["start", "stop"] })
        .setOptions("command", { stop: true })
        .addExamples([ "this a example of the use" ]);

      cmd.showUsage();
      var out = _.clone(outputs)
      h.expect(out).to.deep.property("[00]",
        t("commands.help.usage", 'test_help [options] {subcommand} [*command]')
      );
      h.expect(out).to.deep.property("[02]", 'Test help description');
      h.expect(out).to.deep.property("[04]", t('commands.help.options'));
      h.expect(out).to.deep.property("[06]", '  --verbose, -v, -vv  Verbose mode (default: false) - multiples supported');
      h.expect(out).to.deep.property("[07]", '  --flag-default, -F  Flag with default (default: true)');
      h.expect(out).to.deep.property("[08]", '  --flag, -f          Boolean flag (default: false)');
      h.expect(out).to.deep.property("[09]", '  --string=""         String option');
      h.expect(out).to.deep.property("[10]", '');
      h.expect(out).to.deep.property("[11]", 'subcommand:');
      h.expect(out).to.deep.property("[13]", '  start  Start service');
      h.expect(out).to.deep.property("[14]", '  stop   Stop service');
      h.expect(out).to.deep.property("[15]", '');
      h.expect(out).to.deep.property("[16]", t('commands.help.examples'));
      h.expect(out).to.deep.property("[17]", '');
      h.expect(out).to.deep.property("[18]", '  this a example of the use');
    });

    it("shund support a prefix in usage", function() {
      var cmd = new TestCmd('test_help {subcommand} [command]', UI);
      cmd.showUsage("azk %s {after}");
      h.expect(_.clone(outputs)).to.deep.property("[00]",
        t("commands.help.usage", 'azk test_help {subcommand} [command] {after}')
      );
    });
  });
});
