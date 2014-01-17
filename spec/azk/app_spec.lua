local helper = require('spec.spec_helper')
local utils  = require('azk.utils')
local fs     = require('azk.utils.fs')
local path   = require('azk.utils.path')
local shell  = require('azk.cli.shell')

local azk = require('azk')
local app = require('azk.app')

describe("Azk app", function()
  describe("in valid a 'azk app' folder", function()
    local base_dir = helper.tmp_dir()
    local box_dir  = path.join(base_dir, "box")

    setup(function()
      fs.cp_r(helper.fixture_path("test-box"), box_dir)
    end)

    teardown(function()
      fs.rm_rf(base_dir)
    end)

    it("should return a new app id", function()
      local id = app.new_id()
      assert.is.equal(15, #id)
      assert.is.match(id, "^[0-9a-f]+$")
    end)

    it("should return a manifest", function()
      local result, file = app.find_manifest(box_dir)
      assert.is_true(result)
      assert.is.equal(path.join(box_dir, azk.manifest), file)
    end)

    it("should find nanifest in tree", function()
      local _, file   = app.find_manifest(box_dir)
      local _, finded = app.find_manifest(path.join(box_dir, "scripts"))
      assert.is.equal(file, finded)
    end)

    it("should return not found manifest", function()
      local project = utils.tmp_dir()
      local result, file, err = app.find_manifest(project)
      assert.is_false(result)
      assert.is.blank(file)
      assert.is.match(err,
        helper.escape_regexp(
          shell.format("no such '%{yellow}%s%{reset}' in current project", azk.manifest)
        )
      )
    end)
  end)
end)
