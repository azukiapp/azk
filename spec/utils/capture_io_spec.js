import { Q } from 'azk';
import h from 'spec/spec_helper';
import capture_io from 'azk/utils/capture_io';

describe("Azk capture_io utils helper", function() {
  it("should capture outputs", function() {
    var promise = capture_io( () => {
      process.stdout.write('stdout write ');
      console.log('output to stdout');
      console.error('output to stderr');
      return 'return value';
    })

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
        done.notify('notification');
        console.log('output in stdout');
        done.resolve(1);
      })

      return done.promise;
    }

    it("should capture outputs", function() {
      return capture_io(block).spread((result, outs) => {
        h.expect(result).to.equal(1);
        h.expect(outs.stdout).to.equal("output in stdout\n");
      });
    });

    it("should support progress", function() {
      var promise = capture_io(block);
      var notify  = [];
      promise.progress((notification) => notify.push(notification));

      return promise.spread((result, outs) => {
        h.expect(notify).to.eql(['notification']);
        h.expect(result).to.equal(1);
        h.expect(outs.stdout).to.equal("output in stdout\n");
      });
    });
  });
});
