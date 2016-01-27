import h from 'spec/spec_helper';
import { _ } from 'azk';
import { publish, subscribe } from 'azk/utils/postal';
import { promisifyClass, promisifyModule } from 'azk/utils/promises';
import { async, asyncUnsubscribe, defer } from 'azk/utils/promises';
import { nfcall, ninvoke, nbind } from 'azk/utils/promises';
import { all, isPromise } from 'azk/utils/promises';
import { promiseResolve, promiseReject } from 'azk/utils/promises';

describe("Azk utils promises:", function() {

  describe("promisifyModule classes:", function() {
    var FooBar = function(name) {
      this.name = name;
    };
    FooBar.prototype.getAsyncName = function(callback) {
      setImmediate( () => {
        if (this.name) {
          callback(null, this.name);
        } else {
          callback(new Error());
        }
      });
    };

    var OtherBar = promisifyClass(FooBar);

    it("should not promisifyClass a original class", function(done) {
      var a = new FooBar('aname');
      h.expect(a.getAsyncName(function(err, name) {
        h.expect(err).not.exist;
        h.expect(name).to.equal('aname');
        done();
      })).not.exist;
    });

    it("should promisifyClass a class methods", function() {
      var b = new OtherBar('bname');
      var c = new OtherBar('cname');

      return all([
        b.getAsyncName(), c.getAsyncName()
      ]).then((results) => {
        h.expect(results).to.eql(['bname', 'cname']);
      });
    });
  });

  describe("promisifyClass functions:", function() {
    var mod = {
      getAsyncName(name, callback) {
        setImmediate( () => {
          callback(null, name);
        });
      }
    };

    var a = promisifyModule(mod);

    it("should promisifyClass a methods", function() {
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

  describe("promises helpers:", function() {
    var will_solve = () => promiseResolve(1);
    var will_fail =  () => promiseReject(new Error());

    it("should return a error in promise scope", function() {
      var promise = defer(() => { throw new Error(); });
      return h.expect(promise).to.eventually.rejectedWith(Error);
    });

    it("shoudl convert return in a promise", function() {
      var promise = defer(() => 1);
      return h.expect(promise).to.eventually.equal(1);
    });

    describe('all:', function () {
      it("should all call all promises", function() {
        return all([
          h.expect(will_solve()).to.eventually.equal(1),
          h.expect(will_fail()).to.eventually.rejectedWith(Error),
        ])
        .then(function (result) {
          h.expect(result).to.containSubset([1, undefined]);
        });
      });
    });

    describe('isPromise:', function () {
      it('should verify if it is a promise', function () {

        return all([
          isPromise(promiseResolve()),

          isPromise(defer((resolve) => resolve())),

          isPromise(async(function* () { yield will_solve(); })),

          isPromise(
            asyncUnsubscribe(
              this,
              subscribe('topic', () => {}),
              function* () { yield will_solve(); }
            )
          ),
        ])
        .then(function (results) {
          var allTrue = _.every(results, (item) => item === true);
          h.expect(allTrue).to.be.true;
        });
      });
    });

    describe('async:', function () {
      it("should support a async alias", function() {
        var promise = async(function* () {
          var number = yield will_solve();
          h.expect(number).to.equal(1);
          return true;
        });

        return promise.then((result) => {
          h.expect(result).to.equal(true);
        });
      });

      it("should support a sync with bind", function() {
        this.var = 'onevalue';
        /* jshint ignore:start */
        return h.expect(async(this, function* () {
          h.expect(this.var).to.equal('onevalue');
          return true;
        })).to.eventually.ok;
        /* jshint ignore:end */
      });

      it("should reject on when throwing errors", function() {
        var promise = async(function* () {
          yield promiseResolve('RESOLVED');
          throw new Error('WILL BE REJECTED');
        });

        return promise
        .then(function () {
          throw new Error('should be rejected');
        })
        .catch((err) => {
          h.expect(err).to.instanceOf(Error);
        });
      });
    });

    describe('asyncUnsubscribe:', function () {

      var events;
      var subscription;
      const TOPIC = 'test.promise_spec.asyncUnsubscribe.message';

      beforeEach(function () {
        events = [];
        subscription = subscribe(TOPIC, function (data) {
          events.push(data);
        });
      });

      it("should asyncUnsubscribe unsubscribe from postal subscription", function() {
        var promise = asyncUnsubscribe(this, subscription, function* () {
          var number = yield will_solve();
          publish(TOPIC, number);
          return 'RESOLVED';
        });

        // subscript still active
        h.expect(subscription.inactive).to.be.undefined;

        return promise.then((result) => {
          // subscript is now inactive
          h.expect(subscription.inactive).to.equal(true);
          return h.expect(result).to.equal('RESOLVED');
        });
      });

      it("should asyncUnsubscribe unsubscribe from postal subscription even on errors", function() {
        var promise = asyncUnsubscribe(this, subscription, function* () {
          yield will_fail();
        });

        // subscript still active
        h.expect(subscription.inactive).to.be.undefined;

        return promise
        .then(function () {
          throw new Error('should be rejected');
        })
        .catch((result) => {
          // subscript is now inactive
          h.expect(subscription.inactive).to.equal(true);
          return h.expect(result).to.instanceOf(Error);
        });
      });
    });

    describe('wrap the given nodeFunction:', function () {

      const CONTEXT_ERROR_MESSAGE = 'could not find context';

      class MyClass {
        constructor(prefix) {
          this.prefix = prefix;
          this.inner_property = 'INNER_PROPERTY';
        }
        myNodeStyleMethod(sufix, callback) {
          if (this) {
            var result = '';
            if (this.prefix) {
              // PREFIX-
              result += this.prefix;
            }
            // INNER_PROPERTY
            result += this.inner_property;
            if (sufix) {
              // -SUFIX
              result += sufix;
            }
            callback(null, result);
          } else {
            callback(new Error(CONTEXT_ERROR_MESSAGE));
          }
        }
      }

      describe('nfcall:', function () {
        it("should call node function without context", function() {
          var myClass = new MyClass('PREFIX-');
          return async(function* () {
            return yield nfcall(myClass.myNodeStyleMethod, '-SUFIX');
          })
          .then(function () {
            throw new Error('should be rejected');
          })
          .catch(function (err) {
            h.expect(err).to.instanceOf(Error);
            h.expect(err.cause).to.match(new RegExp(CONTEXT_ERROR_MESSAGE));
          });
        });

        it("should call a \'binded\' node function", function() {
          var myClass = new MyClass('PREFIX-');
          return async(function* () {
            return yield nfcall(myClass.myNodeStyleMethod.bind(myClass), '-SUFIX');
          })
          .then(function (result) {
            h.expect(result).to.equal('PREFIX-INNER_PROPERTY-SUFIX');
          });
        });
      });

      describe('nbind:', function () {
        it("should call node function without context", function() {
          var myClass = new MyClass('PREFIX-');
          return async(function* () {
            var myNodeStyleMethod = nbind(myClass.myNodeStyleMethod);
            return yield myNodeStyleMethod('-SUFIX');
          })
          .then(function () {
            throw new Error('should be rejected');
          })
          .catch(function (err) {
            h.expect(err).to.instanceOf(Error);
            h.expect(err.cause).to.match(new RegExp(CONTEXT_ERROR_MESSAGE));
          });
        });

        it("should call a \'binded\' node function", function() {
          var myClass = new MyClass('PREFIX-');
          return async(function* () {
            var myNodeStyleMethod = nbind(myClass.myNodeStyleMethod, myClass);
            return yield myNodeStyleMethod('-SUFIX');
          })
          .then(function (result) {
            h.expect(result).to.equal('PREFIX-INNER_PROPERTY-SUFIX');
          });
        });
      });

      describe('ninvoke:', function () {

        it("should call a method of an obj in his context", function() {
          return async(function* () {
            var myClass = new MyClass('PREFIX-');
            var result = yield ninvoke(myClass, 'myNodeStyleMethod', '-SUFIX');
            h.expect(result).to.equal('PREFIX-INNER_PROPERTY-SUFIX');
          });
        });
      });
    });

  });
});
