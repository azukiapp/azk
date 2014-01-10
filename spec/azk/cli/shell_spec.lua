local helper = require('spec.spec_helper')
local colors = require('ansicolors')
local each   = require('fun').each

local shell = require('azk.cli.shell')

describe("Azk cli shell", function()
  it("should format before print", function()
    local result = shell.io_capture(function()
      shell.print("%s %s", "foo", "bar")
    end)

    assert.is.equal("foo bar\n", result)
  end)

  it("should format with colors", function()
    local result = shell.io_capture(function()
      shell.print("%{red}%s%{reset} %{green}%s", "foo", "bar")
    end)

    local sample = colors.noReset("%{red}foo%{reset} %{green}bar\n")
    assert.is.equal(sample, result)
  end)

  it("should capture entender data", function()
    local result = nil
    local output = shell.io_capture(function()
      shell.fake_input("foo bar\n", function()
        result = shell.capture("text?")
      end)
    end)

    assert.is.equal("text?", output)
    assert.is.equal("foo bar", result)
  end)

  local logs_type = {
    ['error'] = "red",
    info      = "blue",
    warning   = "yellow"
  }

  it("should format logs messages", function()
    each(function(log, color)
      local result = shell.io_capture(function()
        shell[log]("already %s", "exists")
      end)

      local sample = colors(string.format(
        "%%{%s}azk %s%%{reset}: already exists",
        color, log
      ))
      assert.is.equal(sample .. "\n", result)
    end, logs_type)
  end)
end)
