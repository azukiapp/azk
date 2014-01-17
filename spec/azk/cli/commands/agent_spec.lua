local cli    = require('azk.cli')
local shell  = require('azk.cli.shell')
local helper = require('spec.spec_helper')
local io     = require('io')

local command = require('azk.cli.commands.agent')

describe("Azk #cli #command #agent", function()
  it("should execute a remove command in agent", function()
    local output = shell.capture_io(function()
      command.run("exec", "uname")
    end)

    assert.is.equal("Linux\n", output.stdout)
  end)

  it("should return a remote exit code", function()
    local result = command.run("exec", "/bin/bash", "-c", "exit 1")
    assert.is.equal(1, result)
  end)
end)
