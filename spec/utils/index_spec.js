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
});

