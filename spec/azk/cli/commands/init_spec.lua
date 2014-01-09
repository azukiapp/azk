local cli    = require('azk.cli')
local shell  = require('azk.cli.shell')
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
end)
