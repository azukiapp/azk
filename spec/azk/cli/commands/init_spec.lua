local azk    = require('azk')
local cli    = require('azk.cli')
local shell  = require('azk.cli.shell')
local detect = require('azk.cli.detect')
local helper = require('spec.spec_helper')

local fs = require('azk.utils.fs')

local command = require('azk.cli.commands.init')

function run_capture(...)
  local args = {...}
  return shell.io_capture(function()
    command.run(unpack(args))
  end)
end

describe("Azk cli init command", function()
  it("should generate and return a app id", function()
    local result = run_capture("--id")
    assert.is.equal(16, #result)
    assert.is.match(result, "^[0-9a-f]+\n$")
  end)

  it("should use current directory", function()
    fs.cd(helper.fixture_path('test-box'), function()
      local result = run_capture()
      assert.is.match(result, "'%./azkfile.json' already exists")
    end)
  end)

  it("should support path as a parameter", function()
    local path   = helper.fixture_path('test-box')
    local result = run_capture(path)

    local expect = helper.escape_regexp(
      "'" .. path .. "/azkfile.json' already exists"
    )
    assert.is.match(result, expect)
  end)

  it("should ask for the box", function()
    local output = nil
    local path   = helper.tmp_dir()

    shell.fake_input("test-box\n", function()
      output = shell.io_capture(function()
        command.run(path)
      end)
    end)

    assert.is.match(output, "Enter a box: ")
  end)

  it("should sugest default box", function()
    local output  = nil
    local project = helper.tmp_dir()
    fs.touch(project .. "/Gemfile")

    shell.fake_input("\n", function()
      output = shell.io_capture(function()
        command.run(project)
      end)
    end)

    local detected = detect.inspect(project)
    local msg = shell.format("Enter a box (default: %{yellow}%s%{reset}): ", detected.box)
    assert.is.match(output, helper.escape_regexp(msg))
  end)

  it("should valid a box name", function()
    local output  = nil
    local project = helper.tmp_dir()

    shell.fake_input("\n  \nazukiapp/ruby-box\n", function()
      output = shell.io_capture(function()
        command.run(project)
      end)
    end)

    assert.is.match(output, "%[init%] '' is a invalid box name")
    assert.is.match(output, "%[init%] '  ' is a invalid box name")
  end)

  it("should create a manifest file", function()
    local output   = nil
    local project  = helper.tmp_dir()
    local manifest = project .. "/" .. azk.manifest
    fs.touch(project .. "/Gemfile")

    shell.fake_input("\n", function()
      output = shell.io_capture(function()
        command.run(project)
      end)
    end)

    local detected = detect.inspect(project)
    local data = fs.read(manifest)

    assert.is.match(data, '"box": "' .. helper.escape_regexp(detected.box))
    assert.is.match(data, '"id": "[0-9a-f]+"')
    assert.is.match(output, "%[init%] '.*/" .. azk.manifest .. "' generated")
  end)
end)
