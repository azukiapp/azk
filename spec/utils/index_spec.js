import { expect, fixture_path } from 'spec/spec_helper';
import utils from 'azk/utils';

describe("Azk utils module", function() {
  it("should run function in cwd", function() {
    var current = process.cwd();
    var other = null;
    utils.cd(__dirname, () => {
      other = process.cwd();
    })
    expect(current).to.not.equal(other);
    expect(current).to.equal(process.cwd());
    expect(other).to.equal(__filename);
  });
});

