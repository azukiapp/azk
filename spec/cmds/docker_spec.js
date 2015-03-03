import h from 'spec/spec_helper';
import { init } from 'azk/cmds/docker';

h.describeSkipVm("Azk command docker, run", function() {
  var outputs = [];
  var UI   = h.mockUI(beforeEach, outputs);
  var cmd  = init(UI);

  it("should call `azk vm ssh`", function() {
    cmd.cwd = __dirname;
    return cmd.run(["images"]).then(() => {
      h.expect(outputs[0]).to.match(/azk vm ssh -t/);
      h.expect(outputs[0]).to.match(RegExp("cd.*" + h.escapeRegExp(__dirname)));
      h.expect(outputs[0]).to.match(/; docker images/);
    });
  });

  it("should forwarding all arguments", function() {
    var args = ["run", "/bin/bash", "-c", "ls -l"];
    return cmd.run(args).then(() => {
      var regex = /; docker run \/bin\/bash -c \\"ls -l\\"/;
      h.expect(outputs[0]).to.match(regex);
    });
  });
});
