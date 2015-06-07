import h from 'spec/spec_helper';
import { lazy_require } from 'azk';

var l = lazy_require({
  IPublisher    : ['azk/utils/postal'],
  channel       : ['azk/utils/postal'],
  subscribe     : ['azk/utils/postal'],
  publish       : ['azk/utils/postal'],
  subscriptions : ['azk/utils/postal'],
  unsubscribeAll: ['azk/utils/postal'],
});

describe("Azk utils, postal module", function() {
  beforeEach(() => {
    l.channel.unsubscribeAll();
  });

  it("should support subscribe and publish with defailt channel", function(done) {
    var topic = "test.postal.module";
    var data  = { data: true };
    var subs  = l.subscribe(topic, (msg) => {
      h.expect(msg).to.eql(data);
      subs.unsubscribe();
      done();
    });

    l.publish(topic, data);
  });

  it("should return all subscribe for default channel if call subscriptions", function() {
    var topic = "test.subscriptions";
    var sub   = l.subscribe(topic, () => {});
    var subs  = l.subscriptions();
    h.expect(subs).to.eql([sub]);
  });

  it("should support unsubscribe all subscriptions", function() {
    var topic = "test.subscriptions";
    var sub   = l.subscribe(topic, () => {});
    var subs  = l.subscriptions();
    h.expect(subs).to.eql([sub]);
    l.unsubscribeAll();
    subs = l.subscriptions();
    h.expect(subs).to.not.eql([sub]);
  });

  it("should raise erro if subscribe without topic", function() {
    var sub = () => l.subscribe();
    h.expect(sub).to.throw(Error, /suply a topicName/);

    var pub = () => l.publish();
    h.expect(pub).to.throw(Error, /suply a topicName/);
  });

  describe("have a class IPublisher", function() {
    var topic = 'test.postal.module.IPublisher';

    class MyClass extends l.IPublisher {
      constructor() {
        super(topic);
      }

      test_publish(...args) {
        this.publish(...args);
      }
    }

    it("should support publish with default prefix topic", function(done) {
      var data  = { data: true };
      var subs  = l.subscribe(topic + '.*', (msg) => {
        h.expect(msg).to.eql(data);
        subs.unsubscribe();
        done();
      });

      var obj = new MyClass();
      obj.test_publish('subtopic', data);
    });

    it("should support subscribe with default prefix topic", function(done) {
      var data = { data: true };
      var obj  = new MyClass();

      var subs = obj.subscribe((msg) => {
        h.expect(msg).to.eql(data);
        subs.unsubscribe();
        done();
      });

      obj.test_publish('subtopic', data);
    });
  });
});
