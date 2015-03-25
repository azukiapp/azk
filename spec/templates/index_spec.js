import { async } from 'azk';
import h from 'spec/spec_helper';
import { Template } from 'azk/templates';
import { UI } from 'azk/cli/ui';

describe("Azk templates class, main set", function() {
  it("should any", function() {
    return async(this, function* () {
      var template = yield Template.fetch(__dirname + '/ngrok.js', UI);
      console.log(template);
      yield template.process();
      h.expect(true).is.ok;
    });
  });
});
