local helper = require('spec.spec_helper')
local colors = require('ansicolors')
local each   = require('fun').each

local shell = require('azk.cli.shell')

describe("Azk cli #shell", function()
  it("should capture stdout and stdin", function()
    local result = shell.capture_io(function()
      print("with print")
      io.stdout:write("stdout with io")
      io.stderr:write("stderr with io")
    end)

    assert.is.match(result.stdout, "with print")
    assert.is.match(result.stdout, "stdout with io")
    assert.is.match(result.stderr, "stderr with io")
  end)

  it("should format before print", function()
    local result = shell.capture_io(function()
      shell.print("%s %s", "foo", "bar")
    end)

    assert.is.equal("foo bar\n", result.stdout)
  end)

  it("should format with colors", function()
    local result = shell.capture_io(function()
      shell.print("%{red}%s%{reset} %{green}%s", "foo", "bar")
    end)

    local sample = colors.noReset("%{red}foo%{reset} %{green}bar\n")
    assert.is.equal(sample, result.stdout)
  end)

  it("should capture entender data", function()
    local result = nil
    local output = shell.capture_io("foo bar", function()
      result = shell.capture("text >")
    end)

    assert.is.equal("text >", output.stdout)
    assert.is.equal("foo bar", result)
  end)

  local logs_type = {
    ['error'] = "red",
    info      = "blue",
    warning   = "yellow"
  }

  it("should format logs messages", function()
    each(function(log, color)
      local result = shell.capture_io(function()
        shell[log]("already %s", "exists")
      end)

      local sample = colors(string.format(
        "%%{%s}azk %s%%{reset}: already exists",
        color, log
      ))
      assert.is.equal(sample .. "\n", result.stdout)
    end, logs_type)
  end)
end)
