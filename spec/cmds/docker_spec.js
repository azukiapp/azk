import h from 'spec/spec_helper';
import { config } from 'azk';
import { init } from 'azk/cmds/docker';

var desc = (config('agent:requires_vm')) ? describe : describe.skip;

h.describeSkipVm("Azk command docker, run", function() {
  var outputs = [];
  var UI   = h.mockUI(beforeEach, outputs);
  var cmd  = init(UI);
  var argv = process.argv;

  afterEach(() => process.argv = argv);

  it("should call `azk vm ssh`", function() {
    cmd.cwd = __dirname;
    process.argv = [null, null, null, "images"];
    return cmd.run().then(() => {
      h.expect(outputs[0]).to.match(/azk vm ssh -t/);
      h.expect(outputs[0]).to.match(RegExp("cd.*" + h.escapeRegExp(__dirname)));
      h.expect(outputs[0]).to.match(/; docker images/);
    });
  });

  it("should forwarding all arguments", function() {
    process.argv = [null, null, null, "run", "/bin/bash", "-c", "ls -l"];
    return cmd.run().then(() => {
      var regex = /; docker run \/bin\/bash -c \\"ls -l\\"/;
      h.expect(outputs[0]).to.match(regex);
    });
  });
});
