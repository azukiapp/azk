local helper = require('spec.spec_helper')
local cli    = require('azk.cli')
local shell  = require('azk.cli.shell')

os.exit = function() end

local exec_cmd = require('azk.cli.commands.exec')

describe("Azk #cli test", function()
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

  it("should run a command with args", function()
    local output = shell.capture_io(function()
      cli.run("init", "--id")
    end)

    assert.is.match(output.stdout, "^[0-9a-f]+\n$")
  end)

  it("should show error if execute a invalid command", function()
    local output = shell.capture_io(function()
      shell.print("result: " .. cli.run("not_exist"))
    end)

    assert.is.match(output.stderr, "azk error.*: no such command 'not_exist'")
    assert.is.match(output.stdout, "Some useful azk commands are:")
    assert.is.match(output.stdout, "result: 1")
  end)

  it("should run specific module command", function()
    local result = cli.run("spec.fixtures.custom_command", function()
      return 1
    end)

    assert.is.equal(result, 1)
  end)

  it("should show a internal error", function()
    local output = shell.capture_io(function()
      cli.run("spec.fixtures.custom_command", function()
        error({ msg = "um error" })
      end)
    end)

    assert.is.match(output.stderr, "internal error 'um error'")
  end)
end)
