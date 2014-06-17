import h from 'spec/spec_helper';
import { config } from 'azk';
import { init } from 'azk/cmds/docker';

describe("Azk command docker, run", function() {
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var cmd = init(UI);

  it("should call `azk vm ssh`", function() {
    cmd.cwd = __dirname;
    return cmd.run(["images"]).then(() => {
      h.expect(outputs[0]).to.match(/azk vm ssh -t/);
      h.expect(outputs[0]).to.match(RegExp("cd.*" + h.escapeRegExp(__dirname)));
      h.expect(outputs[0]).to.match(/; docker images/);
    });
  });

  it("should forwarding all arguments", function() {
    return cmd.run(["run", "/bin/bash", "-c", "ls -l"]).then(() => {
      var regex = /; docker run \\"\/bin\/bash\\" \\"-c\\" \\"ls -l\\"/;
      h.expect(outputs[0]).to.match(regex);
    });
  });
});
