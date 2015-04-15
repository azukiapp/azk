import h from 'spec/spec_helper';
import { Tracker } from 'azk/utils/tracker';

// azk nvm grunt --grep='Azk Tracker'

describe("Azk Tracker", function() {

  var trackerAzk;

  beforeEach(function () {
    trackerAzk = new Tracker({ use_fork: false });
  });

  it("should instantiate Tracker", function() {
    return h.expect(trackerAzk).to.not.be.undefined;
  });

  it.skip("should track forking", function(done) {
    // FIXME: mock trackerAzk.track
    trackerAzk = new Tracker();
    trackerAzk.track('TEST_FROM_AZK_USING_FORK', { key: 'value' })
      .then(function (is_ok) {
        h.expect(is_ok).to.equal(0);
        done();
      });
  });

  it.skip("should track without forking", function(done) {
    // FIXME: mock trackerAzk.track
    trackerAzk.track('TEST_FROM_AZK', { key: 'value' })
      .then(function (results) {
        h.expect(results[0].created).to.equal(true);
        done();
      });
  });

  it("should generateRandomId", function() {
    var new_hash = trackerAzk.generateRandomId();
    h.expect(new_hash.length).to.equal(8);
  });

  it("should save and load session id", function(done) {
    this.timeout(1000);
    trackerAzk.saveAgentSessionId()
      .then(trackerAzk.loadAgentSessionId())
      .then(function (session_id) {
        h.expect(session_id.length).to.equal(8);
        done();
      });
  });

  it("should add data to be tracked", function() {
    trackerAzk.addData({ key: 'value' });
    var data = trackerAzk.data;
    h.expect(data.key).to.not.be.undefined;
  });

});
