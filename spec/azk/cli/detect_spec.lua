local helper = require('spec.spec_helper')
local fs     = require('azk.utils.fs')
local detect = require('azk.cli.detect')

local azk = require('azk')

describe("Azk cli detect tool", function()
  it("should detect project type for path", function()
    local path = helper.tmp_dir()
    fs.touch(path .. "/" .. "Gemfile")

    local detected = detect.inspect(path)
    assert.is.match(detected.box, "ruby")

    fs.touch(path .. "/" .. "package.json")
    detected = detect.inspect(path)
    assert.is.match(detected.box, "node")
  end)

  it("should format template", function()
    local project_path = helper.tmp_dir()
    local manifest = project_path .. "/" .. azk.manifest

    fs.touch(project_path .. "/" .. "Gemfile")
    local detected = detect.inspect(project_path)
    detect.render(detected, manifest)

    local data = fs.read(manifest)
    assert.is.match(data, helper.escape_regexp(detected.box))
  end)
end)
