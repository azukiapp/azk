import { Q, lazy_require } from 'azk';
import { publish, subscribe } from 'azk/utils/postal';
import h from 'spec/spec_helper';

var lazy = lazy_require({
  capture_io: ["azk/utils/capture_io"],
});

describe("Azk capture_io utils helper", function() {
  it("should capture outputs", function() {
    var promise = lazy.capture_io( () => {
      process.stdout.write('stdout write ');
      console.log('output to stdout');
      console.error('output to stderr');
      return 'return value';
    });

    return promise.spread((result, outs) => {
      h.expect(result).to.equal('return value');
      h.expect(outs.stdout).to.match(/stdout write/);
      h.expect(outs.stdout).to.match(/output to stdout/);
      h.expect(outs.stderr).to.equal("output to stderr\n");
    });
  });

  describe("in a promise", function() {
    var block = () => {
      var done = Q.defer();

      setImmediate( () => {

        publish("capture_io_spec", 'notification');

        console.log('output in stdout');
        done.resolve(1);
      });

      return done.promise;
    };

    it("should capture outputs", function() {
      return lazy.capture_io(block).spread((result, outs) => {
        h.expect(result).to.equal(1);
        h.expect(outs.stdout).to.equal("output in stdout\n");
      });
    });

    it("should support progress", function() {
      var promise = lazy.capture_io(block);
      var events  = [];

      var _subscription = subscribe('capture_io_spec', (event) => {
        events.push(event);
      });

      return promise.spread((result, outs) => {
        _subscription.unsubscribe();

        h.expect(events).to.eql(['notification']);
        h.expect(result).to.equal(1);
        h.expect(outs.stdout).to.equal("output in stdout\n");
      });
    });
  });
});
