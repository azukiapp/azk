--require('spec.helper')

local cli   = require('azk.cli')
local shell = require('azk.cli.shell')

local exec_cmd = require('azk.cli.commands.exec')

describe("Azk #cli test", function()
  it("should show help if blank invocation", function()
    local output = shell.io_capture(function()
      cli.run()
    end)
  end)

  it("should be return version", function()
    local output = shell.io_capture(function()
      cli.run("--version")
    end)
    assert.are.equal(output, "azk 0.0.1\n")
  end)

  it("should print helper", function()
    local output = shell.io_capture(function()
      cli.run("--help")
    end)

    assert.is.match(output, "Usage: azk <command> %[<args>%]")
  end)

  it("should print command list in help", function()
    local output = shell.io_capture(function()
      cli.run("--help")
    end)

    local short = exec_cmd.short_help:gsub("%-", "%%-")

    assert.is.match(output, "Some useful azk commands are:")
    assert.is.match(output, "   exec.*" .. short )
  end)
end)
