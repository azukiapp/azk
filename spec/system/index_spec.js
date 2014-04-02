import Azk from 'azk';
import { expect, fixture_path } from 'spec/spec_helper';
import { System } from 'azk/system';

describe("Azk system class", function() {
  it("should return a System class", function() {
    var sys = new System("foobar", "api");
    expect(sys).to.have.property('namespace', 'foobar');
    expect(sys).to.have.property('name', 'api');
  });
});
