import h from 'spec/spec_helper';
import { TermsController } from 'azk/cli/terms_controller';

describe('Azk cli, terms controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);
  var run_options = { ui: ui, cwd: __dirname };
  var namespace = 'test_terms_of_use';

  it("should support disable require accept of terms", function() {
    var cmd = new TermsController(run_options);
    cmd.require_terms = false;
    var result = cmd.askTermsOfUse({}, namespace);
    return h.expect(result).to.eventually.ok;
  });
});
