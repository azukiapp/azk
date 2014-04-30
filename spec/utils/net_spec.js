import h from 'spec/spec_helper';
import { config } from 'azk';
import { net } from 'azk/utils';

describe("azk utils.net module", function() {
  it("should get a free port", function() {
    var portrange = config("agent:portrange_start");
    return h.expect(net.getPort()).to.eventually.above(portrange - 1);
  });

  it("should calculate net ip from a ip", function() {
    h.expect(net.calculateNetIp('192.168.50.4')).to.equal('192.168.50.1');
  });
});
