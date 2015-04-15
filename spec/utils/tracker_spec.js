import h from 'spec/spec_helper';
import { Tracker } from 'azk/utils/tracker';

// azk nvm grunt --grep='Azk Tracker'

describe("Azk Tracker", function() {

  var tracker;

  beforeEach(function () {
    tracker = new Tracker({ use_fork: false });
  });

  it("should instantiate Tracker", function() {
    return h.expect(tracker).to.not.be.undefined;
  });

  it.skip("should track forking", function(done) {
    // FIXME: mock tracker.track
    tracker = new Tracker();
    tracker.loadMetadata().then(function () {
      tracker.track('TEST_FROM_AZK_USING_FORK', { key: 'value' })
        .then(function (is_ok) {
          h.expect(is_ok).to.equal(0);
          done();
        });
    });
  });

  it.skip("should track without forking", function(done) {
    // FIXME: mock tracker.track
    tracker.track('TEST_FROM_AZK', { key: 'value' })
      .then(function (results) {
        h.expect(results[0].created).to.equal(true);
        done();
      });
  });

  it("should generateRandomId", function() {
    var new_hash = Tracker.generateRandomId();
    h.expect(new_hash.length).to.equal(8);
  });

  it("should save and load session id", function(done) {
    this.timeout(1000);
    Tracker.saveAgentSessionId()
      .then(Tracker.loadAgentSessionId())
      .then(function (session_id) {
        /**/console.log('\n>>---------\n session_id:\n', session_id, '\n>>---------\n');/*-debug-*/
        h.expect(session_id.length).to.equal(8);
        done();
      });
  });

  it("should add data to be tracked", function() {
    tracker.addData({ key: 'value' });
    var data = tracker.data;
    h.expect(data.key).to.not.be.undefined;
  });

});
