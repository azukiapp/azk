import Azk from 'azk';
import h from 'spec/spec_helper';
import { System } from 'azk/manifest/system';

describe("Azk system class", function() {
  it("should return a System class", function() {
    var sys = new System({});
    h.expect(sys).to.have.property('data').and.eql({});
  });
});
