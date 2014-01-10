local helper = require('spec.spec_helper')
local fs     = require('azk.utils.fs')

local ruby = require('azk.cli.detect.ruby')

describe("Azk cli detect ruby project", function()
  local ruby_project = helper.tmp_dir()

  setup(function()
    fs.touch(ruby_project .. "/" .. "Gemfile")
  end)

  it("should return nil if evidence is ruby project does not exist", function()
    local path = helper.tmp_dir()
    assert.is.blank(ruby.detect(path))
  end)

  it("should a ruby if have a Gemfile", function()
    local result = ruby.detect(ruby_project)
    assert.is.equal("azukiapp/ruby-box#stable", result.box)
  end)
end)
