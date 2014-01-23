local azk    = require('azk')
local cli    = require('azk.cli')
local shell  = require('azk.cli.shell')
local detect = require('azk.cli.detect')
local helper = require('spec.spec_helper')

local fs = require('azk.utils.fs')

local command = require('azk.cli.commands.init')

local function run_capture(...)
  local args = {...}
  return shell.capture_io(function()
    command.run(unpack(args))
  end)
end

describe("Azk cli init command", function()
  it("should generate and return a app id", function()
    local result = run_capture("--id")
    assert.is.equal(16, #result.stdout)
    assert.is.match(result.stdout, "^[0-9a-f]+\n$")
  end)

  it("should use current directory", function()
    fs.cd(helper.fixture_path('test-box'), function()
      local result = run_capture()
      assert.is.match(result.stderr, "'%./azkfile.json' already exists")
    end)
  end)

  it("should support path as a parameter", function()
    local path   = helper.fixture_path('test-box')
    local result = run_capture(path)

    local expect = helper.escape_regexp(
      "'" .. path .. "/azkfile.json' already exists"
    )
    assert.is.match(result.stderr, expect)
  end)

  it("should ask for the box", function()
    local path   = helper.tmp_dir()

    local output = shell.capture_io("test-box\n", function()
      command.run(path)
    end)

    assert.is.match(output.stdout, "Enter a box: ")
  end)

  it("should sugest default box", function()
    local project = helper.tmp_dir()
    fs.touch(project .. "/Gemfile")

    local result = shell.capture_io("\n", function()
      command.run(project)
    end)

    local detected = detect.inspect(project)
    local msg = shell.format("Enter a box (default: %{yellow}%s%{reset}): ", detected.box)
    assert.is.match(result.stdout, helper.escape_regexp(msg))
  end)

  it("should valid a box name", function()
    local project = helper.tmp_dir()
    local output  = shell.capture_io("\n  \nazukiapp/ruby-box\n", function()
      command.run(project)
    end)

    assert.is.match(output.stderr, "%[init%] '' is a invalid box name")
    assert.is.match(output.stderr, "%[init%] '  ' is a invalid box name")
  end)

  it("should create a manifest file", function()
    local output   = nil
    local project  = helper.tmp_dir()
    local manifest = project .. "/" .. azk.manifest
    fs.touch(project .. "/Gemfile")

    output = shell.capture_io("\n", function()
      command.run(project)
    end)

    local detected = detect.inspect(project)
    local data = fs.read(manifest)

    assert.is.match(data, '"box": "' .. helper.escape_regexp(detected.box))
    assert.is.match(data, '"id": "[0-9a-f]+"')
    assert.is.match(output.stderr, "%[init%] '.*/" .. azk.manifest .. "' generated")
  end)
end)
