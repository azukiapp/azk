var path = require('path');
import h from 'spec/spec_helper';
import { t }  from 'azk';
import { Cli, Command } from 'azk/cli/cli';
import {
  InvalidOptionError,
  InvalidValueError,
  RequiredOptionError
} from 'azk/utils/errors';

describe('Azk cli module', function() {
  var outputs = [];
  var UI = h.mockUI(beforeEach, outputs);

  var cmds = path.join(__dirname, '../fixtures/cmds');
  var cli  = new Cli('azk-test', UI, cmds);

  it("should load and connect commands", function() {
    h.expect(cli).have.deep.property('commands.test_options')
      .and.instanceOf(Command);
  });

  it("should run a command", function() {
    cli.run(['test_options', '-n', '20']);
    h.expect(outputs).to.eql([{ number: 20, __leftover: []}]);
  });

  it("should raise a invalid command", function() {
    var func = () => cli.run(['invalid_cmd']);
    h.expect(func).to.throw(InvalidValueError, /invalid_cmd.*command/);
  });

  it("should show a usage subcommand", function() {
    cli.showUsage("test_options");
    h.expect(outputs).to.deep.property("[00]",
      t("commands.help.usage", 'azk-test test_options [options]')
    );
  });
});


