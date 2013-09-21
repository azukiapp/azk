var vows = require('vows');
var assert = require('assert');

vows.describe('hello world').addBatch({

  "A Context" : {
    topic : { foo: 'bar' },
    'it works' : function (topic) { assert.equal(topic.foo, "bar"); },
    teardown : function (topic) { topic.foo = "baz" }
  },

  "Hello": {
    topic: { hello: "hello world" },
    "`world`": function (topic) {
      assert.equal("hello world", topic.hello);
      assert.equal(1, true);
      assert.strictEqual(1, 2 - 1);
    }
  }

}).export(module);

