var vows = require('vows');
var assert = require('assert');
var AzkCli = require('../lib/azk-cli');

var CommanderMock = function() {
  return {
    version: function(version) {
      this._version = version;
    },
    getVersion: function() {
      return this._version;
    },
    wasCommandInitialized: function() {
      return this._commandInitialized || false;
    },
    parse: function(args) {
      this.args = args;
    },
    getArgs: function() {
      return this.args || [];
    }
  }
};

var MyCommand = function(program) {
  program._commandInitialized = true;
};

vows.describe('AzkCli').addBatch({
  '.': {

    topic: function() {
      var mock = new CommanderMock();
      return {
        cli: new AzkCli(mock),
        mock: mock
      }
    },

    "`version`": {
      topic: function(topic) {
        return {
          cli: topic.cli,
          mock: topic.mock,
          version: topic.cli.version('0.0.1')
        };
      },
      "set commander version": function(topic) {
        assert.equal(topic.mock.getVersion(), '0.0.1');
      },
      "method chaining return same instance": function(topic) {
        assert.strictEqual(topic.version, topic.cli);
      }
    },

    "`command`": {
      topic: function(topic) {
        return {
          cli: topic.cli,
          mock: topic.mock,
          command: topic.cli.command(MyCommand)
        };
      },
      "instantiate class command" : function(topic) {
        assert.ok(topic.mock.wasCommandInitialized());
      },
      "method chaining return same instance": function(topic) {
        assert.strictEqual(topic.command, topic.cli);
      }
    },

    "`runWithArgs`": {
      topic: function(topic) {
        return {
          mock: topic.mock,
          args: topic.cli.runWithArgs(['test', 'with', 'args'])
        }
      },
      "call commander parse with args": function(topic) {
        assert.deepEqual(topic.mock.getArgs(), ['test', 'with', 'args'])
      },
      "return commander args": function(topic) {
        assert.deepEqual(topic.args, ['test', 'with', 'args']);
      }
    }

  }
}).export(module);

