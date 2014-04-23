var path = require('path');
import h from 'spec/spec_helper';
import { Command } from 'azk/cli';

describe.only('Azk cli module', function() {
  var cmds = path.join(__dirname, '../fixtures/cmds');
  var userInt = {
    dir(...args) {
      outputs.push(...args);
    }
  }
  var cli  = new Command("azk-test", userInt, cmds);
  //cli.addOption('debug', 'd', Boolean, "Debug description");
  //cli.addOption('verbose', 'v', Boolean, "Verbose description");
  var outputs = [];

  beforeEach(() => outputs = []);

  it("should load and connect commands", function() {
    h.expect(cli).have.deep.property('subCommands.test')
      .and.instanceOf(Command);
  });

  it("should parse args and exec", function() {
    cli.run(['test', '--number', '1', '-fv']);
    h.expect(outputs).to.eql([{ number: 1, verbose: true, flag: true }]);
    //console.log(outputs);
    //h.expect(outputs).to.match(/test --echo 1/);
  });
});

