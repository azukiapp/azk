import h from 'spec/spec_helper';
import { default as tracker } from 'azk/utils/tracker';

describe("Azk Tracker", function() {
  this.timeout(2000);

  it("should instantiate Tracker", function() {
    return h.expect(tracker).to.not.be.undefined;
  });

  it("should generateRandomId", function() {
    var label = 'agent_session_id';
    var new_hash = tracker.generateRandomId(label);
    var expected = label + ':' + '123456789012345';
    h.expect(new_hash.length).to.equal(expected.length);
  });

  it("should save and load session id", function() {
    var sessionId = tracker.generateNewAgentSessionId();
    var expectedSessionId = tracker.loadAgentSessionId();
    h.expect(sessionId).to.equal(expectedSessionId);
  });

});
