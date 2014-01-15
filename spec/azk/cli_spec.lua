--require('spec.helper')

local cli   = require('azk.cli')
local shell = require('azk.cli.shell')

local exec_cmd = require('azk.cli.commands.exec')

describe("Azk #cli #this test", function()
  it("should show help if blank invocation", function()
    local output = shell.capture_io(function()
      cli.run()
    end)
  end)

  it("should be return version", function()
    local output = shell.capture_io(function()
      cli.run("--version")
    end)
    assert.are.equal(output.stdout, "azk 0.0.1\n")
  end)

  it("should print helper", function()
    local output = shell.capture_io(function()
      cli.run("--help")
    end)

    assert.is.match(output.stdout, "Usage: azk <command> %[<args>%]")
  end)

  it("should print command list in help", function()
    local output = shell.capture_io(function()
      cli.run("--help")
    end)

    local short = exec_cmd.short_help:gsub("%-", "%%-")

    assert.is.match(output.stdout, "Some useful azk commands are:")
    assert.is.match(output.stdout, "   exec.*" .. short )
  end)
end)
