local helper = require('spec.spec_helper')
local colors = require('ansicolors')
local tablex = require('pl.tablex')

local shell = require('azk.cli.shell')

describe("Azk cli #shell", function()

  it("should capture stdout and stdin", function()
    local result = shell.capture_io(function()
      print("with print")
      io.stdout:write("stdout with io\n")
      io.stderr:write("stderr with io\n")
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
    local output = shell.capture_io("foo bar", function()
      shell.info("Log info")
      print("Result: " .. shell.capture("text >"))
    end)

    assert.is.match(output.stderr, "Log info")
    assert.is.match(output.stdout, "text >")
    assert.is.match(output.stdout, "Result: foo bar")
  end)

  it("should return error in capture_io", function()
    local result, err = pcall(shell.capture_io, function()
      error("one error")
    end)

    assert.is_false(result)
    assert.is.match(err, "one error")
  end)

  it("should capture only write", function()
    local result = shell.capture_io(function()
      shell.write("only write a line")
    end)

    assert.is.match(result.stdout, "only write a line")
  end)

  it("should return error in capture_io", function()
    local result, err = pcall(shell.capture_io, function()
      error("one error")
    end)

    assert.is_false(result)
    assert.is.match(err, "one error")
  end)

  local logs_type = {
    ['error'] = "red",
    info      = "blue",
    warning   = "yellow"
  }

  it("should format logs messages", function()
    tablex.foreach(logs_type, function(color, log)
      local result = shell[log .. "_format"](
        "already %s", "exists"
      )

      local sample = colors(string.format(
        "%%{%s}azk %s%%{reset}: already exists",
        color, log
      ))
      assert.is.equal(sample, result)
    end)
  end)

  it("should format and output logs messages", function()
    tablex.foreach(logs_type, function(color, log)
      local result = shell.capture_io(function()
        shell[log]("already %s", "exists")
      end)

      local sample = colors(string.format(
        "%%{%s}azk %s%%{reset}: already exists",
        color, log
      ))
      assert.is.equal(sample .. "\n", result.stderr)
    end)
  end)
end)
