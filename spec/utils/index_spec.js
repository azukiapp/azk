import { join } from 'path';
import h from 'spec/spec_helper';
import utils from 'azk/utils';
import { Q } from 'azk/utils';

describe("azk utils module", function() {
  it("should run function in cwd", function() {
    var current = process.cwd();
    var other = null;
    utils.cd(__dirname, () => {
      other = process.cwd();
    })
    h.expect(current).to.not.equal(other);
    h.expect(current).to.equal(process.cwd());
    h.expect(other).to.equal(__dirname);
  });

  it("should real resolve a path", function() {
    var result = utils.resolve('./', '../');
    h.expect(result).to.equal(join(process.cwd(), '..'));
  });

  describe("in a class with async method", function() {
    class FooBar {
      constructor(name) { this.name = name };
      getAsyncName(callback) {
        setImmediate( () => {
          if (this.name)
            callback(null, this.name);
          else
            callback(new Error());
        });
      }
    }

    var OtherBar = utils.qify(FooBar);

    it("should not qify a original class", function(done) {
      var a = new FooBar('aname');
      h.expect(a.getAsyncName(function(err, name) {
        h.expect(err).not.exist;
        h.expect(name).to.equal('aname');
        done();
      })).not.exist;
    });

    it("should qify a class methods", function() {
      var b = new OtherBar('bname');
      var c = new OtherBar('cname');

      return Q.all([
        b.getAsyncName(), c.getAsyncName()
      ]).then((results) => {
        h.expect(results).to.eql(['bname', 'cname']);
      })
    });
  });

  describe("in a module with async functions", function() {
    var mod = {
      getAsyncName(name, callback) {
        setImmediate( () => {
            callback(null, name);
        });
      }
    }
    var a = utils.qifyModule(mod);

    it("should qify a methods", function() {
      return h.expect(a.getAsyncName('name')).to.eventually.equal('name');
    });

    it("should not change original method", function(done) {
      mod.getAsyncName('oname', function(err, name) {
        h.expect(err).to.not.exist;
        h.expect(name).to.equal('oname');
        done();
      });
    });
  });

  describe("provides facilities to use Q", function() {
    var defer = utils.defer;
    var async = utils.async;

    var will_solve = () => {
      return defer((resolve, reject, notify) => {
        process.nextTick(() => {
          notify("notify");
          resolve(1);
        });
      });
    }

    var will_fail = () => {
      return defer((resolve, reject, notify) => {
        process.nextTick(() => reject(new Error()));
      });
    }

    it("should return a error in promise scope", function() {
      var promise = defer(() => {
        self.test();
      });

      return h.expect(promise).to.eventually.rejectedWith(Error);
    });

    it("should support create a promise in a short alias", function() {
      return Q.all([
        h.expect(will_solve()).to.eventually.equal(1),
        h.expect(will_fail()).to.eventually.rejectedWith(Error),
      ]);
    });

    it("should support a async alias", function() {
      var events   = [];
      var progress = (event) => events.push(event);

      var promise = async(function* (notify) {
        notify("fromasync");
        var number = yield will_solve();
        h.expect(number).to.equal(1);
        return true;
      }).progress(progress);

      return promise.then((result) => {
        h.expect(result).to.equal(true);
        h.expect(events).to.include("notify");
        h.expect(events).to.include("fromasync");
      });
    });
  });
});

