local hh     = require('spec.spec_helper')
local utils  = require('azk.utils')
local fs     = require('azk.utils.fs')
local path   = require('azk.utils.path')
local shell  = require('azk.cli.shell')

local azk = require('azk')
local app = require('azk.app')

describe("Azk #app", function()
  describe("in valid a 'azk app' folder", function()
    local base_dir = hh.tmp_dir()
    local box_dir  = path.join(base_dir, "test-box")
    local app_dir  = path.join(base_dir, "app")

    setup(function()
      fs.mkdir(app_dir)
      fs.cp_r(hh.fixture_path("test-box"), box_dir)
      fs.cp_r(
        hh.fixture_path("full_azkfile.json"),
        path.join(app_dir, azk.manifest)
      )
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
      local result, file = app.find_manifest(app_dir)
      assert.is_true(result)
      assert.is.equal(path.join(app_dir, azk.manifest), file)
    end)

    it("should find manifest in tree", function()
      local _, file   = app.find_manifest(box_dir)
      local _, finded = app.find_manifest(
        path.join(box_dir, "scripts")
      )
      assert.is.equal(file, finded)
    end)

    it("should return not found manifest", function()
      local project = utils.tmp_dir()
      local result, file, err = app.find_manifest(project)
      assert.is_false(result)
      assert.is.blank(file)
      assert.is.match(err, hh.er(shell.format(
        "no such '%{yellow}%s%{reset}' in current project",
        azk.manifest
      )))
    end)

    it("should find manifest and parse then", function()
      local id = "def73023f3b54e5"
      local result, data = app.new(app_dir)
      assert.is_true(result)
      assert.is.equal(id, data.id)
      assert.is.equal("azk/apps/" .. id, data.imagem)
      assert.is.equal(app_dir, data.path)
      assert.is.equal("../test-box", data.content.box)
      assert.is.equal(box_dir, data.from.path)
    end)

    it("should parse box manifest", function()
      local result, data = app.new(box_dir)
      assert.is_true(result)
      assert.is.equal("ubuntu:12.04", data.from.full_name)
    end)
  end)
end)
