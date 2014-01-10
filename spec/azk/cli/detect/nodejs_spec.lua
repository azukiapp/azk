local helper = require('spec.spec_helper')
local fs     = require('azk.utils.fs')

local nodejs = require('azk.cli.detect.nodejs')

describe("Azk cli detect nodejs project", function()
  local nodejs_project = helper.tmp_dir()

  setup(function()
    fs.touch(nodejs_project .. "/" .. "package.json")
  end)

  it("should return nil if evidence is nodejs project does not exist", function()
    local path = helper.tmp_dir()
    assert.is.blank(nodejs.detect(path))
  end)

  it("should a nodejs if have a package.json", function()
    local result = nodejs.detect(nodejs_project)
    assert.is.equal("azukiapp/node-box#stable", result.box)
  end)
end)
