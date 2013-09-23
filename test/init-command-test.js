var vows = require('vows');
var assert = require('assert');
var InitCommand = require('../lib/init-command');

var CommanderMock = function() {
  return {
    command: function() {
      this.commandCalled = true;
      return this;
    },
    description: function() {
      this.descriptionCalled = true;
      return this;
    },
    option: function() {
      this.optionCalled = true;
      return this;
    },
    action: function() {
      this.actionCalled = true;
      return this;
    }
  }
};

vows.describe('InitCommand').addBatch({
  '.': {
    topic: function() {
      var mock = new CommanderMock();
      new InitCommand(mock);
      return mock;
    },
    '`commander methods was called`': {
      '`command`': function(mock) {
        assert.ok(mock.commandCalled);
      },
      '`description`': function(mock) {
        assert.ok(mock.descriptionCalled);
      },
      '`option`': function(mock) {
        assert.ok(mock.optionCalled);
      },
      '`action`': function(mock) {
        assert.ok(mock.actionCalled);
      }
    }
  }
}).export(module);