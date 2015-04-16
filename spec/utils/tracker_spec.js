import h from 'spec/spec_helper';
import { default as tracker } from 'azk/utils/tracker';
import { Tracker } from 'azk/utils/tracker';

// azk nvm grunt --grep='Azk Tracker'

describe("Azk Tracker", function() {
  this.timeout(2000);

  it("should instantiate Tracker", function() {
    return h.expect(tracker).to.not.be.undefined;
  });

  it.skip("should track forking", function(done) {
    var tracker2 = new Tracker({
        projectId: '5526968d672e6c5a0d0ebec6',
        // jscs:disable maximumLineLength
        writeKey : '5dbce13e376070e36eec0c7dd1e7f42e49f39b4db041f208054617863832309c14a797409e12d976630c3a4b479004f26b362506e82a46dd54df0c977a7378da280c05ae733c97abb445f58abb56ae15f561ac9ad774cea12c3ad8628d896c39f6e702f6b035541fc1a562997cb05768',
        // jscs:enable maximumLineLength
        use_fork : true
      }, {
      permission: 'tracker_permission',
      user_id   : 'tracker_user_id',
      agent_id  : 'agent_session_id',
    });

    tracker2.track('TEST_FROM_AZK_USING_FORK', { key: 'value' })
      .then(function (is_ok) {
        h.expect(is_ok).to.equal(0);
        done();
      });
  });

  it.skip("should track without forking", function(done) {
    var tracker2 = new Tracker({
        projectId: '5526968d672e6c5a0d0ebec6',
        // jscs:disable maximumLineLength
        writeKey : '5dbce13e376070e36eec0c7dd1e7f42e49f39b4db041f208054617863832309c14a797409e12d976630c3a4b479004f26b362506e82a46dd54df0c977a7378da280c05ae733c97abb445f58abb56ae15f561ac9ad774cea12c3ad8628d896c39f6e702f6b035541fc1a562997cb05768',
        // jscs:enable maximumLineLength
        use_fork : false
      }, {
      permission: 'tracker_permission',
      user_id   : 'tracker_user_id',
      agent_id  : 'agent_session_id',
    });

    tracker2.track('TEST_FROM_AZK', { key: 'value' })
      .then(function (results) {
        h.expect(results[0].created).to.equal(true);
        done();
      });
  });

  it("should generateRandomId", function() {
    var label = 'agent_session_id';
    var new_hash = tracker.generateRandomId(label);
    var expected = label + ':' + '12345678';
    h.expect(new_hash.length).to.equal(expected.length);
  });

  it("should save and load session id", function() {
    var sessionId = tracker.generateNewAgentSessionId();
    var expectedSessionId = tracker.loadAgentSessionId();
    h.expect(sessionId).to.equal(expectedSessionId);
  });

  it("should add data to be tracked", function() {
    tracker.addData({ key: 'value' });
    var data = tracker.data;
    h.expect(data.key).to.not.be.undefined;
  });

});
