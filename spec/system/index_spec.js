import Azk from 'azk';
import h from 'spec/spec_helper';
import { System } from 'azk/system';

describe("Azk system class", function() {
  it("should return a System class", function() {
    var sys = new System("foobar", "api");
    h.expect(sys).to.have.property('namespace', 'foobar');
    h.expect(sys).to.have.property('name', 'api');
  });
});
